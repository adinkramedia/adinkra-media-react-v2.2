import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createClient } from "@sanity/client";

const sanity = createClient({
  projectId:
    import.meta.env.VITE_SANITY_PROJECT_ID,

  dataset: "production",

  useCdn: true,

  apiVersion: "2024-01-01",
});

export default function Downloads() {
  const [downloads, setDownloads] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [searchParams] =
    useSearchParams();

  const transactionId =
    searchParams.get(
      "transaction"
    );

  useEffect(() => {
    let cancelled = false;

    const fetchDownloads = async () => {
      /*
       * No transaction ID means
       * there is nothing to retrieve.
       */
      if (!transactionId) {
        if (!cancelled) {
          setError(
            "No purchase transaction was provided."
          );

          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);

        setError(null);

        /*
         * STEP 1
         *
         * Verify that the transaction
         * was recorded as completed.
         */
        const purchaseResponse =
          await fetch(
            `/.netlify/functions/get-paddle-purchase?transaction=${encodeURIComponent(
              transactionId
            )}`,
            {
              method: "GET",

              cache: "no-store",
            }
          );

        const purchaseText =
          await purchaseResponse.text();

        let purchaseData = {};

        try {
          purchaseData =
            purchaseText
              ? JSON.parse(
                  purchaseText
                )
              : {};
        } catch (parseError) {
          throw new Error(
            "The purchase verification server returned an invalid response."
          );
        }

        if (
          !purchaseResponse.ok
        ) {
          throw new Error(
            purchaseData.error ||
              "Your payment could not be verified yet."
          );
        }

        /*
         * Get products saved by
         * the Paddle webhook.
         */
        const purchasedProducts =
          Array.isArray(
            purchaseData.products
          )
            ? purchaseData.products
            : [];

        if (
          purchasedProducts.length === 0
        ) {
          throw new Error(
            "No purchased products were found for this transaction."
          );
        }

        /*
         * Extract product slugs.
         */
        const purchasedSlugs =
          purchasedProducts
            .map(
              (product) =>
                product.slug
            )
            .filter(
              (slug) =>
                typeof slug ===
                  "string" &&
                slug.trim().length >
                  0
            );

        if (
          purchasedSlugs.length === 0
        ) {
          throw new Error(
            "No valid Sanity product slugs were found for this purchase."
          );
        }

        /*
         * Remove duplicate slugs.
         */
        const uniqueSlugs = [
          ...new Set(
            purchasedSlugs
          ),
        ];

        /*
         * STEP 2
         *
         * Retrieve the actual products
         * from Sanity.
         *
         * This replaces Contentful completely.
         */
        const sanityProducts =
          await sanity.fetch(
            `*[
              (_type == "audioTrack" || _type == "album") &&
              slug.current in $slugs
            ]{
              _id,
              _type,
              title,
              "slug": slug.current,

              price,

              fullDownloadFile,

              downloadUrl,

              totalFiles
            }`,
            {
              slugs:
                uniqueSlugs,
            }
          );

        /*
         * Preserve the purchase order.
         */
        const orderedDownloads =
          uniqueSlugs
            .map(
              (slug) =>
                sanityProducts.find(
                  (product) =>
                    product.slug ===
                    slug
                )
            )
            .filter(Boolean);

        if (!cancelled) {
          setDownloads(
            orderedDownloads
          );
        }
      } catch (err) {
        console.error(
          "Downloads fetch error:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load your downloads."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDownloads();

    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-adinkra-bg text-adinkra-gold">
        <p className="text-xl">
          Verifying your purchase...
        </p>
      </div>
    );
  }

  /*
   * Error state.
   */
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-adinkra-bg text-adinkra-gold px-6">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Purchase Verification
        </h1>

        <p className="text-lg text-center max-w-2xl text-adinkra-gold/80">
          {error}
        </p>

        <p className="mt-6 text-center text-adinkra-gold/60">
          If you have just completed your payment,
          please wait a moment and refresh this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-adinkra-bg text-adinkra-gold px-6 py-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
        Thank You for Your Purchase!
      </h1>

      <p className="mb-10 max-w-2xl text-center text-adinkra-gold/80 text-lg">
        Your purchase has been confirmed.
        Your files are ready to download below.
      </p>

      {downloads.length === 0 ? (
        <p className="text-xl opacity-70 text-center">
          No downloadable files were found
          for this purchase.
        </p>
      ) : (
        <div className="w-full max-w-4xl flex flex-col gap-8">
          {downloads.map(
            (item) => {
              /*
               * Single audio track.
               */
              if (
                item._type ===
                "audioTrack"
              ) {
                const downloadFile =
                  Array.isArray(
                    item.fullDownloadFile
                  )
                    ? item
                        .fullDownloadFile?.[0]
                    : item.fullDownloadFile;

                const downloadUrl =
                  downloadFile?.asset?.url ||
                  downloadFile?.url ||
                  null;

                if (!downloadUrl) {
                  return (
                    <div
                      key={
                        item._id
                      }
                      className="bg-adinkra-highlight/10 border border-adinkra-highlight/20 px-6 py-5 rounded-xl text-center"
                    >
                      <p className="font-bold text-xl">
                        {item.title ||
                          "Untitled Track"}
                      </p>

                      <p className="text-sm opacity-70 mt-2">
                        Download file is
                        currently unavailable.
                      </p>
                    </div>
                  );
                }

                return (
                  <a
                    key={
                      item._id
                    }
                    href={
                      downloadUrl
                    }
                    download
                    className="bg-adinkra-highlight text-adinkra-bg px-6 py-5 rounded-xl text-center hover:opacity-90 transition text-lg font-medium shadow-md"
                  >
                    Download:{" "}
                    {item.title ||
                      "Untitled Track"}
                  </a>
                );
              }

              /*
               * Album / collection / pack.
               */
              if (
                item._type ===
                "album"
              ) {
                const downloadUrl =
                  typeof item.downloadUrl ===
                  "string"
                    ? item.downloadUrl.trim()
                    : "";

                if (!downloadUrl) {
                  return (
                    <div
                      key={
                        item._id
                      }
                      className="bg-adinkra-highlight/10 border border-adinkra-highlight/20 px-6 py-5 rounded-xl text-center"
                    >
                      <p className="font-bold text-xl">
                        {item.title ||
                          "Untitled Pack"}
                      </p>

                      <p className="text-sm opacity-70 mt-2">
                        Download file is
                        currently unavailable.
                      </p>
                    </div>
                  );
                }

                return (
                  <a
                    key={
                      item._id
                    }
                    href={
                      downloadUrl
                    }
                    download
                    className="bg-adinkra-highlight text-adinkra-bg px-6 py-5 rounded-xl text-center hover:opacity-90 transition text-lg font-medium shadow-md flex flex-col items-center gap-2"
                  >
                    <span className="font-bold text-xl">
                      Download Pack:{" "}
                      {item.title ||
                        "Untitled Pack"}
                    </span>

                    <span className="text-sm opacity-90">
                      (
                      {item.totalFiles ||
                        "?"}{" "}
                      files)
                    </span>
                  </a>
                );
              }

              return null;
            }
          )}
        </div>
      )}

      <p className="mt-12 text-center text-adinkra-gold/70">
        Your transaction ID:{" "}
        {transactionId}
      </p>

      <p className="mt-2 text-center text-adinkra-gold/50">
        Questions? Contact Adinkra Media
        support.
      </p>
    </div>
  );
}