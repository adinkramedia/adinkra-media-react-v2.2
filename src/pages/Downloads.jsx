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

const MAX_ATTEMPTS = 10;
const RETRY_DELAY = 2000;

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
    searchParams.get("transaction");

  useEffect(() => {
    let cancelled = false;

    const wait = (ms) =>
      new Promise((resolve) =>
        setTimeout(resolve, ms)
      );

    const fetchPurchase = async () => {
      const response =
        await fetch(
          `/.netlify/functions/get-paddle-purchase?transaction=${encodeURIComponent(
            transactionId
          )}`,
          {
            method: "GET",

            cache: "no-store",

            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const responseText =
        await response.text();

      let data = {};

      try {
        data = responseText
          ? JSON.parse(
              responseText
            )
          : {};
      } catch {
        throw new Error(
          "The purchase verification server returned an invalid response."
        );
      }

      return {
        response,
        data,
      };
    };

    const fetchDownloads = async () => {
      /*
       * Make sure we have a Paddle
       * transaction ID.
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
        if (!cancelled) {
          setLoading(true);
          setError(null);
          setDownloads([]);
        }

        /*
         * STEP 1
         *
         * Wait for the Paddle webhook
         * to record the completed transaction
         * in Supabase.
         *
         * Paddle may redirect the customer
         * before the webhook has finished.
         */
        let purchaseData =
          null;

        let lastError =
          "Your payment could not be verified yet.";

        for (
          let attempt = 1;
          attempt <= MAX_ATTEMPTS;
          attempt++
        ) {
          if (cancelled) {
            return;
          }

          try {
            const {
              response,
              data,
            } =
              await fetchPurchase();

            if (response.ok) {
              purchaseData = data;

              /*
               * The transaction exists,
               * so stop retrying.
               */
              break;
            }

            lastError =
              data.error ||
              "Your payment could not be verified yet.";

            console.log(
              `Purchase verification attempt ${attempt}/${MAX_ATTEMPTS}:`,
              lastError
            );
          } catch (verificationError) {
            lastError =
              verificationError.message ||
              "Unable to verify your purchase.";

            console.error(
              "Purchase verification error:",
              verificationError
            );
          }

          /*
           * Give the Paddle webhook time
           * to finish before trying again.
           */
          if (
            attempt <
            MAX_ATTEMPTS
          ) {
            await wait(
              RETRY_DELAY
            );
          }
        }

        /*
         * The transaction was never
         * confirmed in Supabase.
         */
        if (!purchaseData) {
          throw new Error(
            lastError
          );
        }

        /*
         * STEP 2
         *
         * Get the products saved by
         * the Paddle webhook.
         */
        const purchasedProducts =
          Array.isArray(
            purchaseData.products
          )
            ? purchaseData.products
            : [];

        /*
         * A completed transaction without
         * products cannot generate downloads.
         */
        if (
          purchasedProducts.length === 0
        ) {
          throw new Error(
            "Your payment was confirmed, but the purchased products were not recorded. Please contact Adinkra Media support with your transaction ID."
          );
        }

        /*
         * STEP 3
         *
         * Extract valid Sanity slugs.
         */
        const purchasedSlugs =
          purchasedProducts
            .map(
              (product) =>
                typeof product?.slug ===
                "string"
                  ? product.slug.trim()
                  : ""
            )
            .filter(
              (slug) =>
                slug.length > 0
            );

        if (
          purchasedSlugs.length === 0
        ) {
          throw new Error(
            "Your purchase was confirmed, but no valid product information was found."
          );
        }

        /*
         * Remove duplicate products
         * while preserving purchase order.
         */
        const uniqueSlugs = [
          ...new Set(
            purchasedSlugs
          ),
        ];

        console.log(
          "Purchased product slugs:",
          uniqueSlugs
        );

        /*
         * STEP 4
         *
         * Retrieve the actual products
         * from Sanity.
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
         * Check whether every purchased
         * product still exists in Sanity.
         */
        const foundSlugs =
          sanityProducts.map(
            (product) =>
              product.slug
          );

        const missingSlugs =
          uniqueSlugs.filter(
            (slug) =>
              !foundSlugs.includes(
                slug
              )
          );

        if (
          missingSlugs.length > 0
        ) {
          console.error(
            "Purchased products missing from Sanity:",
            missingSlugs
          );

          throw new Error(
            `Some purchased products could not be found: ${missingSlugs.join(
              ", "
            )}`
          );
        }

        /*
         * STEP 5
         *
         * Preserve the exact order
         * in which the products were purchased.
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

        if (
          orderedDownloads.length === 0
        ) {
          throw new Error(
            "No downloadable products were found for this purchase."
          );
        }

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
      <div className="min-h-screen flex items-center justify-center bg-adinkra-bg text-adinkra-gold px-6">
        <div className="text-center">
          <p className="text-xl">
            Confirming your purchase...
          </p>

          <p className="mt-3 text-sm text-adinkra-gold/60">
            Your payment is being verified.
            Your downloads will appear shortly.
          </p>
        </div>
      </div>
    );
  }

  /*
   * Error state.
   */
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-adinkra-bg text-adinkra-gold px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
          Purchase Verification
        </h1>

        <p className="text-lg text-center max-w-2xl text-adinkra-gold/80">
          {error}
        </p>

        <p className="mt-6 text-center text-adinkra-gold/60 max-w-2xl">
          Transaction ID:
          <br />
          <span className="break-all">
            {transactionId}
          </span>
        </p>

        <button
          type="button"
          onClick={() =>
            window.location.reload()
          }
          className="mt-8 bg-adinkra-highlight text-adinkra-bg px-6 py-4 rounded-xl hover:opacity-90 transition text-lg font-medium shadow-md"
        >
          Check Again
        </button>
      </div>
    );
  }

  /*
   * Successful purchase.
   */
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
        <div className="text-center">
          <p className="text-xl opacity-70">
            No downloadable files were found
            for this purchase.
          </p>
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col gap-8">
          {downloads.map(
            (item) => {
              /*
               * SINGLE AUDIO TRACK
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
                  downloadFile?.asset
                    ?.url ||
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
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-adinkra-highlight text-adinkra-bg px-6 py-5 rounded-xl text-center hover:opacity-90 transition text-lg font-medium shadow-md"
                  >
                    Download:{" "}
                    {item.title ||
                      "Untitled Track"}
                  </a>
                );
              }

              /*
               * ALBUM / COLLECTION / PACK
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
                    target="_blank"
                    rel="noopener noreferrer"
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
        Your transaction ID:
        <br />
        <span className="break-all">
          {transactionId}
        </span>
      </p>

      <p className="mt-2 text-center text-adinkra-gold/50">
        Questions? Contact Adinkra Media
        support.
      </p>
    </div>
  );
}