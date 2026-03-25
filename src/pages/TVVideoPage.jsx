import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import { sanity } from "../lib/sanity";
import groq from "groq";

// ✅ YouTube parser (same logic as gallery)
const getEmbedUrl = (url) => {
  if (!url) return "";

  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
  );

  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
};

// ✅ Portable text renderer
const renderPortableText = (blocks) => {
  if (!blocks || !Array.isArray(blocks)) return null;

  return blocks.map((block, index) => {
    if (block._type === "block") {
      return (
        <p key={block._key || index} className="mb-4 opacity-90">
          {block.children?.map((child) => child.text).join(" ")}
        </p>
      );
    }
    return null;
  });
};

// ✅ GROQ QUERY (fetch single video by ID)
const query = groq`
*[_type == "videoDemo" && _id == $id][0] {
  _id,
  title,
  description,
  category,
  youtubeUrl,
  featured,
  premium,
  createdAt,

  thumbnail {
    asset-> {
      url
    }
  },

  relatedTracks[]->{
    _id,
    trackTitle,
    title
  },

  relatedAlbums[]->{
    _id,
    title
  }
}
`;

export default function TVVideoPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH FROM SANITY
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const data = await sanity.fetch(query, { id });
        setVideo(data);
      } catch (err) {
        console.error("Sanity fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  // ✅ Loading state
  if (loading) {
    return (
      <div className="text-center mt-10 text-adinkra-gold">
        Loading video...
      </div>
    );
  }

  // ❌ Not found
  if (!video) {
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

  const embedUrl = getEmbedUrl(video.youtubeUrl);

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen flex flex-col">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12 flex-grow">
        {/* BACK */}
        <div className="mb-6">
          <Link
            to="/gallery"
            className="text-adinkra-highlight hover:underline"
          >
            ← Back to Gallery
          </Link>
        </div>

        {/* VIDEO */}
        {embedUrl ? (
          <div className="aspect-video mb-8 rounded-2xl overflow-hidden shadow-2xl border border-adinkra-highlight/20">
            <iframe
              src={embedUrl}
              allowFullScreen
              className="w-full h-full border-none"
              title={video.title || "Video"}
            />
          </div>
        ) : (
          <div className="mb-6 text-center text-sm italic text-red-400">
            Invalid or missing YouTube URL.
          </div>
        )}

        {/* TITLE */}
        <h1 className="text-3xl font-bold mb-3">
          {video.title || "Untitled"}
        </h1>

        {/* CATEGORY */}
        {video.category && (
          <p className="italic text-sm text-adinkra-gold/70 mb-6">
            {video.category.replace("-", " ")}
          </p>
        )}

        {/* DESCRIPTION */}
        <div className="text-adinkra-gold/90 leading-relaxed">
          {renderPortableText(video.description) || (
            <p>No description available.</p>
          )}
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