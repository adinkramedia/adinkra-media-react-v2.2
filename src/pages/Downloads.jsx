import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createClient } from "contentful";

const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

export default function Downloads() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const purchasedSlugs = searchParams.get("slugs")?.split(",").filter(Boolean) || [];

  useEffect(() => {
    if (!purchasedSlugs.length) {
      setLoading(false);
      return;
    }

    const fetchDownloads = async () => {
      try {
        // Fetch singles (audioTrack)
        const trackRes = await client.getEntries({
          content_type: "audioTrack",
          "fields.slug[in]": purchasedSlugs.join(","),
        });

        // Fetch albums
        const albumRes = await client.getEntries({
          content_type: "album",
          "fields.slug[in]": purchasedSlugs.join(","),
        });

        const allDownloads = [
          ...trackRes.items.map((item) => ({ ...item, type: "track" })),
          ...albumRes.items.map((item) => ({ ...item, type: "album" })),
        ];

        setDownloads(allDownloads);
      } catch (err) {
        console.error("Downloads fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [purchasedSlugs]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-adinkra-bg text-adinkra-gold">
        <p className="text-xl">Loading your downloads...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-adinkra-bg text-adinkra-gold px-6 py-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
        Thank You for Your Purchase!
      </h1>

      <p className="mb-10 max-w-2xl text-center text-adinkra-gold/80 text-lg">
        Your items are ready. Click below to download each track or pack.
      </p>

      {downloads.length === 0 ? (
        <p className="text-xl opacity-70 text-center">
          No purchased items found. If you just bought something, please refresh.
        </p>
      ) : (
        <div className="w-full max-w-4xl flex flex-col gap-8">
          {downloads.map((item) => {
            const f = item.fields || {};
            const title = f.trackTitle || f.title || "Untitled";
            const slug = f.slug || item.sys.id;

            if (item.type === "track") {
              // Single track download
              const downloadFile = Array.isArray(f.fullDownloadFile)
                ? f.fullDownloadFile[0]?.fields?.file?.url
                : f.fullDownloadFile?.fields?.file?.url;

              return downloadFile ? (
                <a
                  key={slug}
                  href={`https:${downloadFile}`}
                  download
                  className="bg-adinkra-highlight text-adinkra-bg px-6 py-4 rounded-xl text-center hover:bg-yellow-500 transition text-lg font-medium shadow-md"
                >
                  Download: {title}
                </a>
              ) : null;
            } else {
              // Album / pack download
              const downloadUrl = f.downloadUrl?.trim();

              return downloadUrl ? (
                <a
                  key={slug}
                  href={downloadUrl}
                  download
                  className="bg-adinkra-highlight text-adinkra-bg px-6 py-5 rounded-xl text-center hover:bg-yellow-500 transition text-lg font-medium shadow-md flex flex-col items-center gap-2"
                >
                  <span className="font-bold text-xl">Download Pack: {title}</span>
                  <span className="text-sm opacity-90">
                    ({f.totalFiles || "?"} files)
                  </span>
                </a>
              ) : null;
            }
          })}
        </div>
      )}

      <p className="mt-12 text-center text-adinkra-gold/70">
        Questions? Contact support or check your email for confirmation.
      </p>
    </div>
  );
}