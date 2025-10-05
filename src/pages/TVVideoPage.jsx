import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { createClient } from "contentful";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SPACE_ID = "8e41pkw4is56";
const ACCESS_TOKEN = "qM0FzdQIPkX6VF4rt8wXzzLiPdgbjmmNGzHarCK0l8I";

const client = createClient({
  space: SPACE_ID,
  accessToken: ACCESS_TOKEN,
});

const getEmbedUrl = (url) => {
  if (!url) return "";

  // Check YouTube watch URL
  const watchMatch = url.match(/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  // Check youtu.be short URL
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  // Check embed URL
  const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) return url;

  return "";
};

const plainTextDescription = (richText) => {
  if (!richText?.content) return "";
  return richText.content
    .map((node) =>
      node.content?.map((child) => child.value || "").join(" ") || ""
    )
    .join("\n\n")
    .trim();
};

export default function TVVideoPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .getEntry(id)
      .then((res) => {
        console.log("Fetched video fields:", res.fields); // For debugging only
        setVideo(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-10 text-adinkra-gold">Loading video...</div>
    );
  }

  if (!video) {
    return (
      <div className="text-center mt-10 text-red-400">Video not found.</div>
    );
  }

  // Access YouTube URL field exactly as Contentful stores it
  const youtubeUrl = video.fields.youTubeUrl || "";

  const embedUrl = getEmbedUrl(youtubeUrl);

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-4">
          <Link to="/adinkra-tv" className="text-adinkra-highlight hover:underline">
            ← Back to Adinkra TV
          </Link>
        </div>

        {embedUrl ? (
          <div className="aspect-video mb-6 rounded overflow-hidden">
            <iframe
              src={embedUrl}
              allowFullScreen
              className="w-full h-full border-none"
              title={video.fields.title || "YouTube Video"}
            />
          </div>
        ) : (
          <div className="mb-6 text-center text-sm italic text-red-400">
            Invalid or missing YouTube URL.
          </div>
        )}

        <h1 className="text-3xl font-bold mb-2">{video.fields.title || "No title"}</h1>
        <p className="italic text-sm text-adinkra-gold/70 mb-4">
          {video.fields.category || "Uncategorized"}
        </p>

        <div className="prose prose-invert max-w-none text-adinkra-gold/90 whitespace-pre-wrap">
          {plainTextDescription(video.fields.description) || "No description available."}
        </div>
      </main>

      
    </div>
  );
}
