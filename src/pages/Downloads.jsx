import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createClient } from "@sanity/client";

const sanity = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: "production",
  useCdn: true,
  apiVersion: "2024-01-01",
});

export default function Downloads() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();

  const transactionId = searchParams.get("transaction");
  const productSlugsParam = searchParams.get("products");

  useEffect(() => {
    let cancelled = false;

    const loadDownloads = async () => {
      try {
        if (!cancelled) {
          setLoading(true);
          setError(null);
          setDownloads([]);
        }

        console.log(
          "[Downloads Debug] ===== STARTING DOWNLOAD PREPARATION ====="
        );

        console.log(
          "[Downloads Debug] Full URL:",
          window.location.href
        );

        console.log(
          "[Downloads Debug] Transaction parameter:",
          transactionId
        );

        console.log(
          "[Downloads Debug] Products parameter:",
          productSlugsParam
        );

        // ---------------------------------------------------------
        // VALIDATE TRANSACTION ID
        // ---------------------------------------------------------

        if (
          typeof transactionId !== "string" ||
          !transactionId.trim()
        ) {
          throw new Error(
            "No Paddle transaction ID was provided."
          );
        }

        // ---------------------------------------------------------
        // VALIDATE PRODUCT SLUGS
        // ---------------------------------------------------------

        if (
          typeof productSlugsParam !== "string" ||
          !productSlugsParam.trim()
        ) {
          throw new Error(
            "No purchased products were provided."
          );
        }

        console.log(
          "[Downloads Debug] Decoded product parameter:",
          productSlugsParam
        );

        const purchasedSlugs = [
          ...new Set(
            productSlugsParam
              .split(",")
              .map((slug) => slug.trim())
              .filter(Boolean)
          ),
        ];

        console.log(
          "[Downloads Debug] Purchased product slugs:",
          purchasedSlugs
        );

        if (purchasedSlugs.length === 0) {
          throw new Error(
            "No valid purchased products were found."
          );
        }

        // ---------------------------------------------------------
        // FETCH PRODUCTS FROM SANITY
        // ---------------------------------------------------------

        console.log(
          "[Downloads Debug] Fetching purchased products from Sanity..."
        );

        // ✅ Correct field names from your schema:
        // audioTrack → fullDownload (file)
        // album      → downloadUrls (array of urls)
        const query = `
          *[
            (_type == "audioTrack" || _type == "album") &&
            slug.current in $slugs
          ]{
            _id,
            _type,
            title,
            "slug": slug.current,
            price,
            fullDownload,
            downloadUrls,
            totalFiles,
            "fullDownloadUrl": fullDownload.asset->url,
            "fullDownloadRef": fullDownload.asset._ref
          }
        `;

        console.log(
          "[Downloads Debug] Sanity query:",
          query
        );

        const sanityProducts = await sanity.fetch(
          query,
          {
            slugs: purchasedSlugs,
          }
        );

        console.log(
          "[Downloads Debug] Sanity returned products:",
          sanityProducts
        );

        if (
          !Array.isArray(sanityProducts) ||
          sanityProducts.length === 0
        ) {
          throw new Error(
            "No downloadable products could be found in the Adinkra Library."
          );
        }

        // ---------------------------------------------------------
        // CHECK FOR MISSING PRODUCTS
        // ---------------------------------------------------------

        const missingSlugs = purchasedSlugs.filter(
          (slug) =>
            !sanityProducts.some(
              (product) =>
                product.slug === slug
            )
        );

        if (missingSlugs.length > 0) {
          console.error(
            "[Downloads Debug] Products missing from Sanity:",
            missingSlugs
          );

          throw new Error(
            `Some purchased products could not be found in the Adinkra Library: ${missingSlugs.join(
              ", "
            )}`
          );
        }

        // ---------------------------------------------------------
        // PRESERVE PURCHASE ORDER
        // ---------------------------------------------------------

        const orderedDownloads = purchasedSlugs
          .map((slug) =>
            sanityProducts.find(
              (product) =>
                product.slug === slug
            )
          )
          .filter(Boolean);

        console.log(
          "[Downloads Debug] Ordered downloads:",
          orderedDownloads
        );

        if (orderedDownloads.length === 0) {
          throw new Error(
            "No downloadable files were found for this purchase."
          );
        }

        // ---------------------------------------------------------
        // DEBUG DOWNLOAD DATA
        // ---------------------------------------------------------

        orderedDownloads.forEach((item) => {
          console.group(
            `[Downloads Debug] Product: ${item.title}`
          );

          console.log("Type:", item._type);
          console.log("Slug:", item.slug);
          console.log("Full download (file):", item.fullDownload);
          console.log("Resolved full download URL:", item.fullDownloadUrl);
          console.log("Download URLs (album):", item.downloadUrls);
          console.log("Asset reference:", item.fullDownloadRef);
          console.log("Total files:", item.totalFiles);

          console.groupEnd();
        });

        if (!cancelled) {
          setDownloads(orderedDownloads);
        }

        console.log(
          "[Downloads Debug] Downloads ready:",
          orderedDownloads
        );
      } catch (err) {
        console.error(
          "[Downloads Debug] Downloads error:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load your downloads."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDownloads();

    return () => {
      cancelled = true;
    };
  }, [
    transactionId,
    productSlugsParam,
  ]);

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-adinkra-bg text-adinkra-gold px-6">
        <div className="text-center">
          <p className="text-xl">
            Preparing your downloads...
          </p>

          <p className="mt-3 text-sm text-adinkra-gold/60">
            Loading your purchased files.
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-adinkra-bg text-adinkra-gold px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
          Downloads
        </h1>

        <p className="text-lg text-center max-w-3xl text-adinkra-gold/80 whitespace-pre-wrap">
          {error}
        </p>

        {transactionId && (
          <p className="mt-6 text-center text-adinkra-gold/60 max-w-2xl">
            Transaction ID:
            <br />

            <span className="break-all">
              {transactionId}
            </span>
          </p>
        )}

        {productSlugsParam && (
          <p className="mt-4 text-center text-adinkra-gold/50 max-w-2xl">
            Products:
            <br />

            <span className="break-all">
              {productSlugsParam}
            </span>
          </p>
        )}

        <button
          type="button"
          onClick={() =>
            window.location.reload()
          }
          className="mt-8 bg-adinkra-highlight text-adinkra-bg px-6 py-4 rounded-xl hover:opacity-90 transition text-lg font-medium shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------
  // SUCCESS PAGE
  // ---------------------------------------------------------

  return (
    <div className="min-h-screen flex flex-col items-center bg-adinkra-bg text-adinkra-gold px-6 py-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
        Thank You for Your Purchase!
      </h1>

      <p className="mb-10 max-w-2xl text-center text-adinkra-gold/80 text-lg">
        Your payment was completed successfully.
        Your files are ready to download below.
      </p>

      <div className="w-full max-w-4xl flex flex-col gap-8">
        {downloads.map((item) => {
          // =====================================================
          // AUDIO TRACK
          // =====================================================

          if (item._type === "audioTrack") {
            // Prefer the resolved URL from GROQ, fall back to nested asset
            let resolvedDownloadUrl =
              item.fullDownloadUrl ||
              item.fullDownload?.asset?.url ||
              null;

            // Sanity files are cross-origin → force download with ?dl
            if (resolvedDownloadUrl) {
              resolvedDownloadUrl = `${resolvedDownloadUrl}?dl`;
            }

            console.log(
              "[Downloads Debug] Rendering audio track:",
              item.title
            );

            console.log(
              "[Downloads Debug] Final audio download URL:",
              resolvedDownloadUrl
            );

            if (!resolvedDownloadUrl) {
              return (
                <div
                  key={item._id}
                  className="bg-adinkra-highlight/10 border border-adinkra-highlight/20 px-6 py-5 rounded-xl text-center"
                >
                  <p className="font-bold text-xl">
                    {item.title || "Untitled Track"}
                  </p>

                  <p className="text-sm opacity-70 mt-2">
                    Download file is currently unavailable.
                  </p>

                  <p className="text-xs opacity-40 mt-3">
                    The payment was successful, but no downloadable
                    file is currently attached to this product.
                  </p>
                </div>
              );
            }

            return (
              <a
                key={item._id}
                href={resolvedDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-adinkra-highlight text-adinkra-bg px-6 py-5 rounded-xl text-center hover:opacity-90 transition text-lg font-medium shadow-md"
              >
                Download: {item.title || "Untitled Track"}
              </a>
            );
          }

          // =====================================================
          // ALBUM / PACK
          // =====================================================

          if (item._type === "album") {
            // downloadUrls is an array of strings in your schema
            let resolvedDownloadUrl = "";

            if (
              Array.isArray(item.downloadUrls) &&
              item.downloadUrls.length > 0
            ) {
              // Take the first URL (you can change this later if you want multiple buttons)
              resolvedDownloadUrl = String(item.downloadUrls[0]).trim();
            }

            console.log(
              "[Downloads Debug] Rendering album:",
              item.title
            );

            console.log(
              "[Downloads Debug] Final album download URL:",
              resolvedDownloadUrl
            );

            if (!resolvedDownloadUrl) {
              return (
                <div
                  key={item._id}
                  className="bg-adinkra-highlight/10 border border-adinkra-highlight/20 px-6 py-5 rounded-xl text-center"
                >
                  <p className="font-bold text-xl">
                    {item.title || "Untitled Pack"}
                  </p>

                  <p className="text-sm opacity-70 mt-2">
                    Download file is currently unavailable.
                  </p>

                  <p className="text-xs opacity-40 mt-3">
                    The payment was successful, but no downloadable
                    pack URL is currently attached to this product.
                  </p>
                </div>
              );
            }

            return (
              <a
                key={item._id}
                href={resolvedDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-adinkra-highlight text-adinkra-bg px-6 py-5 rounded-xl text-center hover:opacity-90 transition text-lg font-medium shadow-md flex flex-col items-center gap-2"
              >
                <span className="font-bold text-xl">
                  Download Pack: {item.title || "Untitled Pack"}
                </span>

                <span className="text-sm opacity-90">
                  ({item.totalFiles || "?"} files)
                </span>
              </a>
            );
          }

          return null;
        })}
      </div>

      {transactionId && (
        <p className="mt-12 text-center text-adinkra-gold/70">
          Your transaction ID:
          <br />

          <span className="break-all">
            {transactionId}
          </span>
        </p>
      )}

      <p className="mt-2 text-center text-adinkra-gold/50">
        Questions? Contact Adinkra Media support.
      </p>
    </div>
  );
}