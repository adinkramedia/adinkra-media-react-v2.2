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

/*
 * Safely extract a URL from a Sanity file/image field.
 *
 * Supports:
 * - Direct URL strings
 * - Sanity asset objects with url
 * - Sanity file references
 * - Arrays containing a file
 */
const getSanityFileUrl = (
  file
) => {
  if (!file) {
    return null;
  }

  /*
   * Direct URL
   */
  if (
    typeof file === "string" &&
    file.trim()
  ) {
    return file.trim();
  }

  /*
   * Direct asset URL
   */
  if (
    typeof file?.asset?.url ===
      "string" &&
    file.asset.url.trim()
  ) {
    return file.asset.url.trim();
  }

  /*
   * Direct URL property
   */
  if (
    typeof file?.url ===
      "string" &&
    file.url.trim()
  ) {
    return file.url.trim();
  }

  /*
   * Sanity asset reference.
   *
   * This is not directly downloadable
   * without resolving it through Sanity.
   */
  if (
    typeof file?.asset?._ref ===
    "string"
  ) {
    console.warn(
      "[Downloads Debug] File contains a Sanity asset reference but no resolved URL:",
      file.asset._ref
    );
  }

  return null;
};

/*
 * Extract the first valid file URL
 * from a possible Sanity file field.
 */
const resolveFileUrl = (
 file
) => {
  /*
   * Array of files
   */
  if (
    Array.isArray(file)
  ) {
    for (
      const entry of file
    ) {
      const url =
        getSanityFileUrl(
          entry
        );

      if (url) {
        return url;
      }
    }

    return null;
  }

  /*
   * Single file
   */
  return getSanityFileUrl(
    file
  );
};

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

  const transactionId =
    searchParams.get(
      "transaction"
    );

  const productSlugsParam =
    searchParams.get(
      "products"
    );

  useEffect(() => {
    let cancelled = false;

    const loadDownloads =
      async () => {
        try {
          console.group(
            "[Downloads Debug] ===== STARTING DOWNLOAD PREPARATION ====="
          );

          if (!cancelled) {
            setLoading(true);
            setError(null);
            setDownloads([]);
          }

          /*
           * --------------------------------------------------
           * TRANSACTION ID
           * --------------------------------------------------
           */

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

          /*
           * --------------------------------------------------
           * PRODUCT SLUGS
           * --------------------------------------------------
           */

          if (
            typeof productSlugsParam !==
              "string" ||
            !productSlugsParam.trim()
          ) {
            throw new Error(
              "No purchased products were provided."
            );
          }

          /*
           * Decode the parameter in case
           * the URL contains encoded values.
           */
          let decodedProducts =
            productSlugsParam;

          try {
            decodedProducts =
              decodeURIComponent(
                productSlugsParam
              );
          } catch (
            decodeError
          ) {
            console.warn(
              "[Downloads Debug] Could not decode products parameter. Using raw value.",
              decodeError
            );
          }

          /*
           * Split comma-separated slugs.
           */
          const purchasedSlugs = [
            ...new Set(
              decodedProducts
                .split(",")
                .map(
                  (slug) =>
                    slug.trim()
                )
                .filter(Boolean)
            ),
          ];

          console.log(
            "[Downloads Debug] Decoded product parameter:",
            decodedProducts
          );

          console.log(
            "[Downloads Debug] Purchased product slugs:",
            purchasedSlugs
          );

          if (
            purchasedSlugs.length ===
            0
          ) {
            throw new Error(
              "No valid purchased products were found."
            );
          }

          /*
           * --------------------------------------------------
           * SANITY QUERY
           * --------------------------------------------------
           */

          console.log(
            "[Downloads Debug] Fetching purchased products from Sanity..."
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

                totalFiles,

                /*
                 * Resolve the Sanity asset URL
                 * directly where possible.
                 */
                "fullDownloadFileUrl":
                  fullDownloadFile.asset->url,

                /*
                 * Keep asset reference
                 * for debugging.
                 */
                "fullDownloadFileRef":
                  fullDownloadFile.asset._ref
              }`,
              {
                slugs:
                  purchasedSlugs,
              }
            );

          console.log(
            "[Downloads Debug] Sanity returned products:",
            sanityProducts
          );

          /*
           * Log each product individually.
           */
          sanityProducts?.forEach(
            (product) => {
              console.group(
                `[Downloads Debug] Product: ${product.title}`
              );

              console.log(
                "ID:",
                product._id
              );

              console.log(
                "Type:",
                product._type
              );

              console.log(
                "Slug:",
                product.slug
              );

              console.log(
                "fullDownloadFile:",
                product.fullDownloadFile
              );

              console.log(
                "fullDownloadFileUrl:",
                product.fullDownloadFileUrl
              );

              console.log(
                "fullDownloadFileRef:",
                product.fullDownloadFileRef
              );

              console.log(
                "downloadUrl:",
                product.downloadUrl
              );

              console.log(
                "totalFiles:",
                product.totalFiles
              );

              console.groupEnd();
            }
          );

          /*
           * --------------------------------------------------
           * VALIDATE SANITY RESULTS
           * --------------------------------------------------
           */

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
           * Check whether every purchased
           * slug exists in Sanity.
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
              "[Downloads Debug] Purchased products missing from Sanity:",
              missingSlugs
            );

            throw new Error(
              `Some purchased products could not be found in the Adinkra Library: ${missingSlugs.join(
                ", "
              )}`
            );
          }

          /*
           * --------------------------------------------------
           * PRESERVE PURCHASE ORDER
           * --------------------------------------------------
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

          /*
           * --------------------------------------------------
           * RESOLVE DOWNLOAD URLS
           * --------------------------------------------------
           */

          const preparedDownloads =
            orderedDownloads.map(
              (product) => {
                let downloadUrl =
                  null;

                /*
                 * AUDIO TRACK
                 */
                if (
                  product._type ===
                  "audioTrack"
                ) {
                  /*
                   * First use the URL
                   * explicitly resolved by Sanity.
                   */
                  if (
                    typeof product.fullDownloadFileUrl ===
                      "string" &&
                    product.fullDownloadFileUrl.trim()
                  ) {
                    downloadUrl =
                      product.fullDownloadFileUrl.trim();
                  }

                  /*
                   * Otherwise inspect
                   * the original field.
                   */
                  if (
                    !downloadUrl
                  ) {
                    downloadUrl =
                      resolveFileUrl(
                        product.fullDownloadFile
                      );
                  }
                }

                /*
                 * ALBUM / PACK
                 */
                if (
                  product._type ===
                  "album"
                ) {
                  /*
                   * Album downloadUrl
                   * is normally already a
                   * direct URL.
                   */
                  if (
                    typeof product.downloadUrl ===
                      "string" &&
                    product.downloadUrl.trim()
                  ) {
                    downloadUrl =
                      product.downloadUrl.trim();
                  }

                  /*
                   * Fallback in case the
                   * album also uses a Sanity
                   * file field.
                   */
                  if (
                    !downloadUrl
                  ) {
                    downloadUrl =
                      resolveFileUrl(
                        product.fullDownloadFile
                      );
                  }

                  /*
                   * Fallback to resolved
                   * Sanity asset URL.
                   */
                  if (
                    !downloadUrl &&
                    typeof product.fullDownloadFileUrl ===
                      "string" &&
                    product.fullDownloadFileUrl.trim()
                  ) {
                    downloadUrl =
                      product.fullDownloadFileUrl.trim();
                  }
                }

                console.log(
                  "[Downloads Debug] Resolved download:",
                  {
                    title:
                      product.title,

                    type:
                      product._type,

                    slug:
                      product.slug,

                    downloadUrl,
                  }
                );

                return {
                  ...product,

                  resolvedDownloadUrl:
                    downloadUrl,
                };
              }
            );

          console.log(
            "[Downloads Debug] Final prepared downloads:",
            preparedDownloads
          );

          console.log(
            "[Downloads Debug] Transaction:",
            cleanTransactionId
          );

          console.groupEnd();

          if (!cancelled) {
            setDownloads(
              preparedDownloads
            );
          }
        } catch (err) {
          console.error(
            "[Downloads Debug] Downloads error:",
            err
          );

          console.groupEnd();

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

  /*
   * --------------------------------------------------
   * LOADING STATE
   * --------------------------------------------------
   */

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

  /*
   * --------------------------------------------------
   * ERROR STATE
   * --------------------------------------------------
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

        {productSlugsParam && (
          <p className="mt-4 text-center text-adinkra-gold/50 max-w-2xl text-sm">
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

  /*
   * --------------------------------------------------
   * SUCCESSFUL PURCHASE
   * --------------------------------------------------
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
            const downloadUrl =
              item.resolvedDownloadUrl;

            /*
             * ------------------------------------------
             * AUDIO TRACK
             * ------------------------------------------
             */

            if (
              item._type ===
              "audioTrack"
            ) {
              if (
                !downloadUrl
              ) {
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

                    <p className="text-xs opacity-50 mt-2">
                      The purchase was successful,
                      but the download file could not
                      be resolved.
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
             * ------------------------------------------
             * ALBUM / PACK
             * ------------------------------------------
             */

            if (
              item._type ===
              "album"
            ) {
              if (
                !downloadUrl
              ) {
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

                    <p className="text-xs opacity-50 mt-2">
                      The purchase was successful,
                      but the download file could not
                      be resolved.
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