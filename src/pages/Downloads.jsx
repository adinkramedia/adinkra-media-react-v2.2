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

  const transactionId =
    searchParams.get("transaction");

  const productSlugsParam =
    searchParams.get("products");

  useEffect(() => {
    let cancelled = false;

    const loadDownloads =
      async () => {
        try {
          if (!cancelled) {
            setLoading(true);
            setError(null);
            setDownloads([]);
          }

          /*
           * --------------------------------------------------
           * VALIDATE TRANSACTION
           * --------------------------------------------------
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

          /*
           * --------------------------------------------------
           * VALIDATE PRODUCTS
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

          const purchasedSlugs = [
            ...new Set(
              productSlugsParam
                .split(",")
                .map(
                  (slug) =>
                    slug.trim()
                )
                .filter(Boolean)
            ),
          ];

          if (
            purchasedSlugs.length ===
            0
          ) {
            throw new Error(
              "No valid purchased products were found."
            );
          }

          console.log(
            "[Downloads Debug] Preparing downloads for transaction:",
            cleanTransactionId
          );

          console.log(
            "[Downloads Debug] Purchased product slugs:",
            purchasedSlugs
          );

          /*
           * --------------------------------------------------
           * FETCH PRODUCTS FROM SANITY
           * --------------------------------------------------
           *
           * IMPORTANT:
           *
           * We resolve the Sanity file asset directly
           * inside GROQ using:
           *
           * fullDownloadFile.asset->url
           *
           * This means the browser receives the actual
           * downloadable URL instead of only the Sanity
           * asset reference.
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

                "fullDownloadFileUrl":
                  fullDownloadFile.asset->url,

                "fullDownloadFileName":
                  fullDownloadFile.asset->originalFilename,

                fullDownloadFile,

                downloadUrl,

                totalFiles
              }`,
              {
                slugs:
                  purchasedSlugs,
              }
            );

          console.log(
            "[Downloads Debug] Sanity products returned:",
            sanityProducts
          );

          /*
           * --------------------------------------------------
           * VALIDATE SANITY PRODUCTS
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
           * --------------------------------------------------
           * DEBUG PRODUCT DATA
           * --------------------------------------------------
           */

          sanityProducts.forEach(
            (product) => {
              console.group(
                `[Downloads Debug] ${product.title}`
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
                "Raw fullDownloadFile:",
                product.fullDownloadFile
              );

              console.log(
                "Resolved file URL:",
                product.fullDownloadFileUrl
              );

              console.log(
                "Resolved filename:",
                product.fullDownloadFileName
              );

              console.log(
                "Album download URL:",
                product.downloadUrl
              );

              console.groupEnd();
            }
          );

          /*
           * --------------------------------------------------
           * CHECK FOR MISSING PRODUCTS
           * --------------------------------------------------
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
              "[Downloads Debug] Missing products:",
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

          console.log(
            "[Downloads Debug] Downloads ready:",
            orderedDownloads
          );

          if (!cancelled) {
            setDownloads(
              orderedDownloads
            );
          }
        } catch (err) {
          console.error(
            "[Downloads Debug] Downloads error:",
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
  }, [
    transactionId,
    productSlugsParam,
  ]);

  /*
   * --------------------------------------------------
   * LOADING
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
   * ERROR
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
   * SUCCESS
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

            /*
             * ------------------------------------------------
             * AUDIO TRACK
             * ------------------------------------------------
             */

            if (
              item._type ===
              "audioTrack"
            ) {
              const downloadUrl =
                typeof item.fullDownloadFileUrl ===
                "string"
                  ? item.fullDownloadFileUrl.trim()
                  : "";

              console.log(
                "[Downloads Debug] Audio download:",
                {
                  title:
                    item.title,

                  slug:
                    item.slug,

                  url:
                    downloadUrl,

                  filename:
                    item.fullDownloadFileName,
                }
              );

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

              return (
                <a
                  key={
                    item._id
                  }
                  href={
                    downloadUrl
                  }
                  download={
                    item.fullDownloadFileName ||
                    true
                  }
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
             * ------------------------------------------------
             * ALBUM / PACK
             * ------------------------------------------------
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

              console.log(
                "[Downloads Debug] Album download:",
                {
                  title:
                    item.title,

                  slug:
                    item.slug,

                  url:
                    downloadUrl,

                  totalFiles:
                    item.totalFiles,
                }
              );

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

            /*
             * ------------------------------------------------
             * UNKNOWN TYPE
             * ------------------------------------------------
             */

            console.warn(
              "[Downloads Debug] Unknown product type:",
              item
            );

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