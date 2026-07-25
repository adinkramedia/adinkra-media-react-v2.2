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

  const slugsParam =
    searchParams.get(
      "slugs"
    );

  useEffect(() => {
    let cancelled = false;

    const fetchDownloads = async () => {
      try {
        if (!cancelled) {
          setLoading(true);
          setError(null);
          setDownloads([]);
        }

        if (!slugsParam) {
          throw new Error(
            "No purchased products were provided."
          );
        }

        const purchasedSlugs = [
          ...new Set(
            slugsParam
              .split(",")
              .map(
                (slug) =>
                  slug.trim()
              )
              .filter(Boolean)
          ),
        ];

        if (
          purchasedSlugs.length === 0
        ) {
          throw new Error(
            "No valid purchased products were found."
          );
        }

        console.log(
          "Loading purchased products:",
          purchasedSlugs
        );

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
          sanityProducts.length === 0
        ) {
          throw new Error(
            "No purchased products could be found."
          );
        }

        const foundSlugs =
          sanityProducts.map(
            (product) =>
              product.slug
          );

        const missingSlugs =
          purchasedSlugs.filter(
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
  }, [slugsParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-adinkra-bg text-adinkra-gold px-6">
        <div className="text-center">
          <p className="text-xl">
            Preparing your downloads...
          </p>

          <p className="mt-3 text-sm text-adinkra-gold/60">
            Your purchased files are being loaded.
          </p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen flex flex-col items-center bg-adinkra-bg text-adinkra-gold px-6 py-12">

      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
        Thank You for Your Purchase!
      </h1>

      <p className="mb-10 max-w-2xl text-center text-adinkra-gold/80 text-lg">
        Your payment was completed successfully.
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
        Questions? Contact Adinkra Media
        support.
      </p>

    </div>
  );
}