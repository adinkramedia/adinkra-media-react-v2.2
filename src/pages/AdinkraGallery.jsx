import { useEffect, useState } from "react";
import { createClient } from "contentful";
import Header from "../components/Header";
import { Link } from "react-router-dom";

const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

// ✅ Robust YouTube embed parser
const getEmbedUrl = (url) => {
  if (!url) return "";

  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
  );

  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
};

// ✅ Safe rich text extraction
const plainTextDescription = (richText) => {
  if (!richText?.content) return "";

  return richText.content
    .map((node) =>
      node.content?.map((child) => child.value || "").join(" ") || ""
    )
    .join(" ")
    .trim()
    .slice(0, 140);
};

export default function AdinkraGallery() {
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    client
      .getEntries({ content_type: "tvVideo" })
      .then((res) => setVideos(res.items || []))
      .catch(console.error);
  }, []);

  const categories = [
    "All",
    "Film Scoring",
    "Sound Design",
    "Demo",
    "Adinkra Original",
  ];

  const filteredVideos =
    selectedCategory === "All"
      ? videos
      : videos.filter(
          (video) =>
            video.fields?.category &&
            video.fields.category.toLowerCase() ===
              selectedCategory.toLowerCase()
        );

  const featured = videos.find((video) => video.fields?.featured);

  const nonFeaturedVideos = filteredVideos.filter(
    (video) => !video.fields?.featured
  );

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      {/* 🎬 HERO */}
      <section className="relative w-full h-[65vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: "url('/tv-hero-desktop.jpg')" }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Sound in Motion
          </h1>

          <p className="text-lg md:text-xl max-w-3xl opacity-90">
            Cinematic scoring, sound design, and custom music crafted for visual storytelling.
          </p>
        </div>
      </section>

      {/* 🎬 FEATURED */}
      {featured && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-adinkra-highlight mb-10">
            Featured Work
          </h2>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-adinkra-highlight/20">
              {getEmbedUrl(featured.fields?.youtubeUrl) ? (
                <iframe
                  src={getEmbedUrl(featured.fields.youtubeUrl)}
                  className="w-full h-full"
                  title={featured.fields?.title || "Featured Video"}
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-red-400 text-sm">
                  Invalid or missing video URL
                </div>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">
                {featured.fields?.title || "Untitled"}
              </h3>

              <p className="text-adinkra-gold/80 mb-6">
                {plainTextDescription(featured.fields?.description) ||
                  "Professional sound design and cinematic scoring."}
              </p>

              <Link
                to="/contact"
                className="inline-block bg-adinkra-highlight text-black font-semibold py-3 px-6 rounded-lg hover:bg-yellow-500 transition"
              >
                Request This Sound →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 🎛 CATEGORY FILTER */}
      <section className="max-w-7xl mx-auto px-6 mt-10 mb-14">
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all border ${
                selectedCategory === cat
                  ? "bg-adinkra-highlight text-black border-adinkra-highlight shadow-md"
                  : "bg-adinkra-highlight/10 border-adinkra-highlight/30 hover:bg-adinkra-highlight/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 🎥 VIDEO GRID */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        {nonFeaturedVideos.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {nonFeaturedVideos.map((video) => {
              const { title, thumbnail, category } = video.fields || {};
              const imageUrl = thumbnail?.fields?.file?.url;

              return (
                <div
                  key={video.sys.id}
                  className="group rounded-xl overflow-hidden"
                >
                  {/* Clickable video card */}
                  <Link to={`/tv-video/${video.sys.id}`}>
                    <div className="aspect-video overflow-hidden relative rounded-xl">
                      {imageUrl ? (
                        <img
                          src={`https:${imageUrl}`}
                          alt={title || "Video"}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-black flex items-center justify-center text-white">
                          ▶
                        </div>
                      )}

                      {/* Play icon */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition">
                        <div className="text-white text-4xl">▶</div>
                      </div>
                    </div>
                  </Link>

                  {/* Info BELOW (no blocking overlay) */}
                  <div className="mt-3 px-1">
                    <h4 className="text-sm font-semibold">
                      {title || "Untitled"}
                    </h4>

                    {category && (
                      <p className="text-xs text-adinkra-gold/70 italic">
                        {category}
                      </p>
                    )}

                    {/* CTA separate, not overlapping */}
                    <Link
                      to="/contact"
                      className="mt-3 inline-block text-xs bg-adinkra-highlight text-black font-semibold py-2 px-4 rounded hover:bg-yellow-500 transition"
                    >
                      Request This Sound
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-adinkra-gold/70 py-20">
            No videos yet — upload your first demo in Contentful.
          </p>
        )}
      </section>
    </div>
  );
}