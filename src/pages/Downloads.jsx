import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

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
        console.log("[Downloads Debug] Full URL:", window.location.href);
        console.log("[Downloads Debug] Transaction:", transactionId);
        console.log("[Downloads Debug] Products param:", productSlugsParam);

        if (typeof transactionId !== "string" || !transactionId.trim()) {
          throw new Error("No Paddle transaction ID was provided.");
        }

        // Server verifies payment with Paddle and returns only paid products.
        // products= is optional (ordering hint only) — access is not based on it.
        const params = new URLSearchParams({
          transaction: transactionId.trim(),
        });
        if (typeof productSlugsParam === "string" && productSlugsParam.trim()) {
          params.set("products", productSlugsParam.trim());
        }

        const res = await fetch(
          `/.netlify/functions/get-downloads?${params.toString()}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        const data = await res.json().catch(() => ({}));

        console.log("[Downloads Debug] get-downloads status:", res.status);
        console.log("[Downloads Debug] get-downloads response:", data);

        if (!res.ok) {
          throw new Error(
            data?.error ||
              "Unable to verify this purchase. Please contact support."
          );
        }

        const products = Array.isArray(data.products) ? data.products : [];

        if (products.length === 0) {
          throw new Error(
            "No downloadable files were found for this purchase."
          );
        }

        products.forEach((item) => {
          console.group(`[Downloads Debug] ${item.title}`);
          console.log("Type:", item._type);
          console.log("Slug:", item.slug);
          console.log("fullDownloadUrl:", item.fullDownloadUrl);
          console.log("downloadUrls:", item.downloadUrls);
          console.groupEnd();
        });

        if (!cancelled) {
          setDownloads(products);
        }
      } catch (err) {
        console.error("[Downloads Debug] Error:", err);
        if (!cancelled) {
          setError(err?.message || "Unable to load your downloads.");
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
  }, [transactionId, productSlugsParam]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-adinkra-bg text-adinkra-gold px-6">
        <div className="text-center">
          <p className="text-xl">Preparing your downloads...</p>
          <p className="mt-3 text-sm text-adinkra-gold/60">
            Loading your purchased files.
          </p>
        </div>
      </div>
    );
  }

  // Error
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
            <span className="break-all">{transactionId}</span>
          </p>
        )}
        {productSlugsParam && (
          <p className="mt-4 text-center text-adinkra-gold/50 max-w-2xl">
            Products:
            <br />
            <span className="break-all">{productSlugsParam}</span>
          </p>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 bg-adinkra-highlight text-adinkra-bg px-6 py-4 rounded-xl hover:opacity-90 transition text-lg font-medium shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Success
  return (
    <div className="min-h-screen flex flex-col items-center bg-adinkra-bg text-adinkra-gold px-6 py-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
        Thank You for Your Purchase!
      </h1>

      <p className="mb-10 max-w-2xl text-center text-adinkra-gold/80 text-lg">
        Your payment was completed successfully.
        {downloads.length > 1
          ? ` You have ${downloads.length} items ready to download below.`
          : " Your files are ready to download below."}
      </p>

      <div className="w-full max-w-4xl flex flex-col gap-8">
        {downloads.map((item) => {
          // ---------- AUDIO TRACK ----------
          if (item._type === "audioTrack") {
            let url =
              item.fullDownloadUrl ||
              item.fullDownload?.asset?.url ||
              null;

            if (url) url = `${url}?dl`;

            if (!url) {
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
                </div>
              );
            }

            return (
              <a
                key={item._id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-adinkra-highlight text-adinkra-bg px-6 py-5 rounded-xl text-center hover:opacity-90 transition text-lg font-medium shadow-md"
              >
                Download: {item.title || "Untitled Track"}
              </a>
            );
          }

          // ---------- ALBUM ----------
          if (item._type === "album") {
            const urls = Array.isArray(item.downloadUrls)
              ? item.downloadUrls
                  .map((u) => String(u).trim())
                  .filter(Boolean)
              : [];

            if (urls.length === 0) {
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
                </div>
              );
            }

            return (
              <div
                key={item._id}
                className="flex flex-col gap-4 bg-adinkra-highlight/5 border border-adinkra-highlight/20 px-6 py-6 rounded-xl"
              >
                <div className="text-center">
                  <p className="font-bold text-xl">
                    {item.title || "Untitled Pack"}
                  </p>
                  <p className="text-sm opacity-80 mt-1">
                    {item.totalFiles || urls.length} files
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {urls.map((url, index) => {
                    let label = `Download Part ${index + 1}`;
                    try {
                      const filename = decodeURIComponent(
                        url.split("/").pop() || ""
                      );
                      if (filename) {
                        label = filename.replace(/\.zip$/i, "");
                      }
                    } catch {
                      // keep default
                    }

                    return (
                      <a
                        key={`${item._id}-${index}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-adinkra-highlight text-adinkra-bg px-6 py-4 rounded-xl text-center hover:opacity-90 transition text-base font-medium shadow-md"
                      >
                        {label}
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {transactionId && (
        <p className="mt-12 text-center text-adinkra-gold/70">
          Your transaction ID:
          <br />
          <span className="break-all">{transactionId}</span>
        </p>
      )}

      <p className="mt-2 text-center text-adinkra-gold/50">
        Questions? Contact{" "}
        <a
          href="mailto:support@adinkramedia.com"
          className="underline hover:opacity-80"
        >
          support@adinkramedia.com
        </a>
        .
      </p>
    </div>
  );
}