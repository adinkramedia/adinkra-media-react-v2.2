import { useEffect, useState } from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { sanity } from "../lib/sanity";
import groq from "groq";

// ✅ YouTube embed parser
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

// ✅ GROQ QUERY
const query = groq`
*[_type == "videoDemo"] | order(createdAt desc) {
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

  // Related content (optional future use)
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

export default function AdinkraGallery() {
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ✅ FETCH FROM SANITY
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await sanity.fetch(query);
        setVideos(data);
      } catch (err) {
        console.error("Sanity fetch error:", err);
      }
    };

    fetchData();
  }, []);

  // ✅ Categories aligned with schema
  const categories = [
    "All",
    "foley",
    "soundtracks",
    "cinematic",
    "ambient",
    "world-traditional",
  ];

  // ✅ FILTER
  const filteredVideos =
    selectedCategory === "All"
      ? videos
      : videos.filter(
          (video) =>
            video.category &&
            video.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  // ✅ FEATURED
  const featured = videos.find((video) => video.featured);
  const nonFeaturedVideos = filteredVideos.filter(
    (video) => !video.featured
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
              {getEmbedUrl(featured.youtubeUrl) ? (
                <iframe
                  src={getEmbedUrl(featured.youtubeUrl)}
                  className="w-full h-full"
                  title={featured.title || "Featured Video"}
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
                {featured.title || "Untitled"}
              </h3>

              <div className="text-adinkra-gold/80 mb-6">
                {renderPortableText(featured.description) || (
                  <p>Professional sound design and cinematic scoring.</p>
                )}
              </div>

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
              {cat === "All"
                ? "All"
                : cat.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>
      </section>

      {/* 🎥 VIDEO GRID */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        {nonFeaturedVideos.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {nonFeaturedVideos.map((video) => {
              const imageUrl = video.thumbnail?.asset?.url;

              return (
                <div
                  key={video._id}
                  className="group rounded-xl overflow-hidden"
                >
                  <Link to={`/tv-video/${video._id}`}>
                    <div className="aspect-video overflow-hidden relative rounded-xl">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={video.title || "Video"}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-black flex items-center justify-center text-white">
                          ▶
                        </div>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition">
                        <div className="text-white text-4xl">▶</div>
                      </div>
                    </div>
                  </Link>

                  <div className="mt-3 px-1">
                    <h4 className="text-sm font-semibold">
                      {video.title || "Untitled"}
                    </h4>

                    {video.category && (
                      <p className="text-xs text-adinkra-gold/70 italic">
                        {video.category.replace("-", " ")}
                      </p>
                    )}

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
            No videos yet — upload your first demo in Sanity.
          </p>
        )}
      </section>
    </div>
  );
}