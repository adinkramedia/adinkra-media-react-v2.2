import { createClient } from "@sanity/client";

const sanity = createClient({
  projectId:
    process.env.SANITY_PROJECT_ID ||
    process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  useCdn: true,
  apiVersion: "2024-01-01",
});

const PAID_STATUSES = new Set(["completed", "paid", "billed"]);

function getPaddleApiBase() {
  const env = (process.env.PADDLE_ENV || "sandbox").toLowerCase();
  return env === "production" || env === "live"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

function htmlError(statusCode, message) {
  return {
    statusCode,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;background:#111;color:#c9a227">
      <h1>Download unavailable</h1>
      <p>${message}</p>
      <p style="opacity:0.6">If you paid for this file, contact support@adinkramedia.com with your transaction ID.</p>
    </body></html>`,
  };
}

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return htmlError(405, "Method not allowed.");
  }

  try {
    const params = event.queryStringParameters || {};
    const transactionId =
      typeof params.transaction === "string" ? params.transaction.trim() : "";
    const slug = typeof params.slug === "string" ? params.slug.trim() : "";
    const fileIndex = Math.max(0, parseInt(params.file || "0", 10) || 0);

    if (!transactionId || !slug) {
      return htmlError(400, "Missing transaction or product.");
    }

    const paddleApiKey = process.env.PADDLE_API_KEY;
    if (!paddleApiKey) {
      console.error("PADDLE_API_KEY missing");
      return htmlError(500, "Server configuration error.");
    }

    // 1. Verify transaction with Paddle
    const paddleRes = await fetch(
      `${getPaddleApiBase()}/transactions/${encodeURIComponent(transactionId)}`,
      {
        headers: {
          Authorization: `Bearer ${paddleApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paddleJson = await paddleRes.json().catch(() => null);
    if (!paddleRes.ok || !paddleJson?.data) {
      return htmlError(403, "This transaction could not be verified.");
    }

    const txn = paddleJson.data;
    const status = String(txn.status || "").toLowerCase();
    if (!PAID_STATUSES.has(status)) {
      return htmlError(403, "This transaction has not been completed.");
    }

    // 2. Product must belong to this paid transaction
    const customProducts = Array.isArray(txn.custom_data?.products)
      ? txn.custom_data.products
      : [];

    const allowedSlugs = new Set(
      customProducts
        .map((p) => (typeof p?.slug === "string" ? p.slug.trim() : ""))
        .filter(Boolean)
    );

    if (!allowedSlugs.has(slug)) {
      return htmlError(403, "This product is not part of this purchase.");
    }

    // 3. Load file location from Sanity
    const product = await sanity.fetch(
      `*[
        (_type == "audioTrack" || _type == "album") &&
        slug.current == $slug
      ][0]{
        _type,
        title,
        "slug": slug.current,
        "fullDownloadUrl": fullDownload.asset->url,
        downloadUrls
      }`,
      { slug }
    );

    if (!product) {
      return htmlError(404, "Product not found.");
    }

    let targetUrl = null;

    if (product._type === "audioTrack") {
      targetUrl = product.fullDownloadUrl || null;
      if (targetUrl && !targetUrl.includes("?")) {
        targetUrl = `${targetUrl}?dl`;
      }
    } else if (product._type === "album") {
      const urls = Array.isArray(product.downloadUrls)
        ? product.downloadUrls.map((u) => String(u).trim()).filter(Boolean)
        : [];
      targetUrl = urls[fileIndex] || null;
    }

    if (!targetUrl) {
      return htmlError(404, "No downloadable file is attached to this product.");
    }

    // 4. Redirect to the real file (URL never shown on the downloads page)
    return {
      statusCode: 302,
      headers: {
        Location: targetUrl,
        "Cache-Control": "no-store",
      },
      body: "",
    };
  } catch (err) {
    console.error("download-file error:", err);
    return htmlError(500, "Something went wrong while preparing your download.");
  }
};