// src/pages/TVVideoPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { createClient } from "contentful";
import Header from "../components/Header";

const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

// ✅ Fixed & reliable YouTube embed parser
const getEmbedUrl = (url) => {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);

    // youtu.be short links
    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // youtube.com/watch?v=
    if (parsedUrl.searchParams.get("v")) {
      const videoId = parsedUrl.searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // already embed link
    if (parsedUrl.pathname.includes("/embed/")) {
      return url;
    }

    return "";
  } catch (err) {
    return "";
  }
};

// ✅ Same rich text parser style
const plainTextDescription = (richText) => {
  if (!richText?.content) return "";

  return richText.content
    .map((node) =>
      node.content?.map((child) => child.value || "").join(" ") || ""
    )
    .join(" ")
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
      <div className="text-center mt-10 text-adinkra-gold">
        Loading video...
      </div>
    );
  }

  if (!video || !video.fields) {
    return (
      <div className="text-center mt-10 text-red-400">
        Video not found.
        <div className="mt-4">
          <Link
            to="/gallery"
            className="text-adinkra-highlight hover:underline"
          >
            ← Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Correct field name from Contentful (case-sensitive)
  const { title, category, description, youTubeUrl } = video.fields;

  const embedUrl = getEmbedUrl(youTubeUrl);

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen flex flex-col">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12 flex-grow">
        {/* Back */}
        <div className="mb-6">
          <Link
            to="/gallery"
            className="text-adinkra-highlight hover:underline"
          >
            ← Back to Gallery
          </Link>
        </div>

        {/* Video */}
        {embedUrl ? (
          <div className="aspect-video mb-8 rounded-2xl overflow-hidden shadow-2xl border border-adinkra-highlight/20">
            <iframe
              src={embedUrl}
              allowFullScreen
              className="w-full h-full border-none"
              title={title || "Video"}
            />
          </div>
        ) : (
          <div className="mb-6 text-center text-sm italic text-red-400">
            Invalid or missing YouTube URL.
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold mb-3">
          {title || "No title"}
        </h1>

        {/* Category */}
        <p className="italic text-sm text-adinkra-gold/70 mb-6">
          {category || "Uncategorized"}
        </p>

        {/* Description */}
        <div className="text-adinkra-gold/90 whitespace-pre-wrap leading-relaxed">
          {plainTextDescription(description) ||
            "No description available."}
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Link
            to="/contact"
            className="inline-block bg-adinkra-highlight text-black font-semibold py-3 px-6 rounded-lg hover:bg-yellow-500 transition"
          >
            Request This Sound →
          </Link>
        </div>
      </main>
    </div>
  );
}