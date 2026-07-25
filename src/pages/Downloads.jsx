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
  const [
    downloads,
    setDownloads,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    searchParams,
  ] = useSearchParams();

  /*
   * Paddle transaction ID from:
   *
   * /downloads?transaction=txn_xxxxx
   */
  const transactionId =
    searchParams.get(
      "transaction"
    );

  useEffect(() => {
    let cancelled = false;

    const loadDownloads =
      async () => {
        try {
          /*
           * Reset state whenever
           * the transaction changes.
           */
          if (!cancelled) {
            setLoading(true);
            setError(null);
            setDownloads([]);
          }

          /*
           * A transaction ID is required.
           */
          if (
            typeof transactionId !==
              "string" ||
            !transactionId.trim()
          ) {
            throw new Error(
              "No Paddle transaction ID was provided."
            );
          }

          const cleanTransactionId =
            transactionId.trim();

          console.log(
            "Loading Paddle transaction:",
            cleanTransactionId
          );

          /*
           * Ask our Netlify function to:
           *
           * 1. Contact Paddle directly.
           * 2. Verify the transaction.
           * 3. Confirm the transaction is completed.
           * 4. Confirm it belongs to Adinkra Media.
           * 5. Read the products from Paddle custom_data.
           *
           * Supabase is NOT used here.
           */
          const response =
            await fetch(
              `/.netlify/functions/get-paddle-purchase?transaction=${encodeURIComponent(
                cleanTransactionId
              )}`,
              {
                method: "GET",

                headers: {
                  Accept:
                    "application/json",
                },

                cache: "no-store",
              }
            );

          /*
           * Safely parse the response.
           */
          const responseText =
            await response.text();

          let data = {};

          try {
            data =
              responseText
                ? JSON.parse(
                    responseText
                  )
                : {};
          } catch (parseError) {
            console.error(
              "Invalid JSON returned from get-paddle-purchase:",
              responseText
            );

            throw new Error(
              `The purchase verification service returned an invalid response (HTTP ${response.status}).`
            );
          }

          console.log(
            "Paddle purchase verification response:",
            {
              status:
                response.status,

              data,
            }
          );

          /*
           * Paddle transaction verification failed.
           */
          if (!response.ok) {
            throw new Error(
              data.error ||
                "Unable to verify your Paddle purchase."
            );
          }

          /*
           * Make sure the backend confirmed
           * a successful verification.
           */
          if (
            data.success !== true
          ) {
            throw new Error(
              "The purchase could not be verified."
            );
          }

          /*
           * Make sure the returned transaction
           * matches the transaction in the URL.
           */
          if (
            data.transactionId !==
            cleanTransactionId
          ) {
            console.error(
              "Transaction ID mismatch:",
              {
                requested:
                  cleanTransactionId,

                returned:
                  data.transactionId,
              }
            );

            throw new Error(
              "The verified transaction does not match the requested transaction."
            );
          }

          /*
           * The backend should only return
           * completed transactions.
           */
          if (
            data.status &&
            data.status !==
              "completed"
          ) {
            throw new Error(
              "This Paddle transaction has not been completed."
            );
          }

          /*
           * Get products from the verified
           * Paddle transaction.
           */
          const purchasedProducts =
            Array.isArray(
              data.products
            )
              ? data.products
              : [];

          if (
            purchasedProducts.length ===
            0
          ) {
            throw new Error(
              "No purchased products were found for this transaction."
            );
          }

          console.log(
            "Verified purchased products:",
            purchasedProducts
          );

          /*
           * Extract Sanity slugs.
           *
           * These slugs were originally stored
           * inside Paddle custom_data when
           * create-paddle-transaction.js
           * created the transaction.
           */
          const purchasedSlugs = [
            ...new Set(
              purchasedProducts
                .map(
                  (product) =>
                    product?.slug
                )
                .filter(
                  (slug) =>
                    typeof slug ===
                      "string" &&
                    slug.trim().length >
                      0
                )
                .map(
                  (slug) =>
                    slug.trim()
                )
            ),
          ];

          if (
            purchasedSlugs.length ===
            0
          ) {
            throw new Error(
              "The completed transaction does not contain valid product information."
            );
          }

          console.log(
            "Purchased Sanity slugs:",
            purchasedSlugs
          );

          /*
           * Retrieve the actual downloadable
           * products from Sanity.
           *
           * Paddle verifies the purchase.
           * Sanity provides the downloadable files.
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
                  purchasedSlugs,
              }
            );

          if (
            !Array.isArray(
              sanityProducts
            ) ||
            sanityProducts.length ===
              0
          ) {
            throw new Error(
              "No downloadable products could be found in the Adinkra Library."
            );
          }

          /*
           * Check that every purchased
           * product still exists in Sanity.
           */
          const missingSlugs =
            purchasedSlugs.filter(
              (slug) =>
                !sanityProducts.some(
                  (product) =>
                    product.slug ===
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
              `Some purchased products could not be found in the Adinkra Library: ${missingSlugs.join(
                ", "
              )}`
            );
          }

          /*
           * Preserve the exact order of
           * products from the Paddle transaction.
           */
          const orderedDownloads =
            purchasedSlugs
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
            orderedDownloads.length ===
            0
          ) {
            throw new Error(
              "No downloadable files were found for this purchase."
            );
          }

          console.log(
            "Downloads ready:",
            orderedDownloads
          );

          if (!cancelled) {
            setDownloads(
              orderedDownloads
            );
          }
        } catch (err) {
          console.error(
            "Downloads error:",
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

    loadDownloads();

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
            Preparing your downloads...
          </p>

          <p className="mt-3 text-sm text-adinkra-gold/60">
            Verifying your Paddle transaction and loading your files.
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
          Downloads
        </h1>

        <p className="text-lg text-center max-w-2xl text-adinkra-gold/80">
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

  /*
   * Successful purchase.
   */
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

        {downloads.map(
          (item) => {

            /*
             * AUDIO TRACK
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

              /*
               * Track has no download URL.
               */
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
                      Download file is currently unavailable.
                    </p>

                  </div>
                );
              }

              /*
               * Track download.
               */
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
             * ALBUM / PACK
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

              /*
               * Album has no download URL.
               */
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
                      Download file is currently unavailable.
                    </p>

                  </div>
                );
              }

              /*
               * Album / pack download.
               */
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