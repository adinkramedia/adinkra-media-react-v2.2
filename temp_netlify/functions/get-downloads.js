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

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function getPaddleApiBase() {
  const env = (process.env.PADDLE_ENV || "sandbox").toLowerCase();
  return env === "production" || env === "live"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

/** Build a proxy download path (no real CDN URL). */
function proxyUrl(transactionId, slug, fileIndex) {
  const q = new URLSearchParams({
    transaction: transactionId,
    slug,
  });
  if (typeof fileIndex === "number") {
    q.set("file", String(fileIndex));
  }
  return `/.netlify/functions/download-file?${q.toString()}`;
}

export const handler = async (event) => {
  if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const params =
      event.httpMethod === "GET"
        ? event.queryStringParameters || {}
        : JSON.parse(event.body || "{}");

    const transactionId =
      typeof params.transaction === "string"
        ? params.transaction.trim()
        : typeof params.transactionId === "string"
        ? params.transactionId.trim()
        : "";

    if (!transactionId) {
      return json(400, { error: "Missing transaction ID" });
    }

    const paddleApiKey = process.env.PADDLE_API_KEY;
    if (!paddleApiKey) {
      console.error("PADDLE_API_KEY is missing");
      return json(500, { error: "Server configuration error" });
    }

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
      return json(404, {
        error: "Transaction not found or not accessible",
        transactionId,
      });
    }

    const txn = paddleJson.data;
    const status = String(txn.status || "").toLowerCase();
    if (!PAID_STATUSES.has(status)) {
      return json(403, {
        error: "This transaction has not been completed.",
        transactionId,
        status,
      });
    }

    const customProducts = Array.isArray(txn.custom_data?.products)
      ? txn.custom_data.products
      : [];

    let purchasedSlugs = customProducts
      .map((p) => (typeof p?.slug === "string" ? p.slug.trim() : ""))
      .filter(Boolean);

    const clientProductsParam =
      typeof params.products === "string" ? params.products : "";

    if (clientProductsParam && purchasedSlugs.length > 0) {
      const clientOrder = [
        ...new Set(
          decodeURIComponent(clientProductsParam)
            .replace(/%2C/gi, ",")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        ),
      ];
      const allowed = new Set(purchasedSlugs);
      const ordered = clientOrder.filter((s) => allowed.has(s));
      const missing = purchasedSlugs.filter((s) => !ordered.includes(s));
      purchasedSlugs = [...ordered, ...missing];
    }

    if (purchasedSlugs.length === 0) {
      return json(400, {
        error:
          "This payment was recorded, but no products were attached to the transaction.",
        transactionId,
      });
    }

    const sanityProducts = await sanity.fetch(
      `*[
        (_type == "audioTrack" || _type == "album") &&
        slug.current in $slugs
      ]{
        _id,
        _type,
        title,
        "slug": slug.current,
        price,
        totalFiles,
        "fullDownloadUrl": fullDownload.asset->url,
        downloadUrls
      }`,
      { slugs: purchasedSlugs }
    );

    if (!Array.isArray(sanityProducts) || sanityProducts.length === 0) {
      return json(404, {
        error: "No downloadable products found for this purchase.",
        transactionId,
      });
    }

    // Replace real file URLs with proxy URLs
    const orderedDownloads = purchasedSlugs
      .map((slug) => sanityProducts.find((p) => p.slug === slug))
      .filter(Boolean)
      .map((item) => {
        if (item._type === "audioTrack") {
          const hasFile = Boolean(item.fullDownloadUrl);
          return {
            _id: item._id,
            _type: item._type,
            title: item.title,
            slug: item.slug,
            price: item.price,
            totalFiles: item.totalFiles,
            // Proxy only — no Sanity CDN URL
            fullDownloadUrl: hasFile
              ? proxyUrl(transactionId, item.slug)
              : null,
            downloadUrls: null,
          };
        }

        if (item._type === "album") {
          const rawUrls = Array.isArray(item.downloadUrls)
            ? item.downloadUrls.map((u) => String(u).trim()).filter(Boolean)
            : [];

          return {
            _id: item._id,
            _type: item._type,
            title: item.title,
            slug: item.slug,
            price: item.price,
            totalFiles: item.totalFiles || rawUrls.length,
            fullDownloadUrl: null,
            // One proxy link per pack file
            downloadUrls: rawUrls.map((_, index) =>
              proxyUrl(transactionId, item.slug, index)
            ),
          };
        }

        return item;
      });

    if (orderedDownloads.length === 0) {
      return json(404, {
        error: "No downloadable files were found for this purchase.",
        transactionId,
      });
    }

    return json(200, {
      success: true,
      transactionId,
      status,
      products: orderedDownloads,
    });
  } catch (err) {
    console.error("get-downloads error:", err);
    return json(500, {
      error: err?.message || "Internal server error",
    });
  }
};