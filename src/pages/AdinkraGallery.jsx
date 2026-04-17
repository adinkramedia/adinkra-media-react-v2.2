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

// ✅ GROQ QUERIES
const videoQuery = groq`
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
    asset-> { url }
  }
}
`;

const audioQuery = groq`
*[_type == "audioComparison"] | order(createdAt desc) {
  _id,
  title,
  description,
  category,
  featured,
  createdAt,
  "rawMixUrl": rawMix.asset->url,
  "cleanMixUrl": cleanMix.asset->url,
  thumbnail {
    asset-> { url }
  }
}
`;

export default function AdinkraGallery() {
  const [videos, setVideos] = useState([]);
  const [audioComparisons, setAudioComparisons] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("video");

  // Fetch Videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await sanity.fetch(videoQuery);
        setVideos(data);
      } catch (err) {
        console.error("Video fetch error:", err);
      }
    };
    fetchVideos();
  }, []);

  // Fetch Audio Comparisons
  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const data = await sanity.fetch(audioQuery);
        setAudioComparisons(data);
      } catch (err) {
        console.error("Audio comparison fetch error:", err);
      }
    };
    fetchAudio();
  }, []);

  // Categories
  const categories = [
    { value: "All", label: "All Categories" },
    { value: "foley", label: "Foley" },
    { value: "soundtracks", label: "Soundtracks" },
    { value: "cinematic", label: "Cinematic" },
    { value: "ambient", label: "Ambient" },
    { value: "world-traditional", label: "World / Traditional" },
  ];

  // Filter function
  const filterItems = (items) =>
    selectedCategory === "All"
      ? items
      : items.filter(
          (item) =>
            item.category &&
            item.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  const filteredVideos = filterItems(videos);
  const filteredAudio = filterItems(audioComparisons);

  const featuredVideo = videos.find((v) => v.featured);
  const nonFeaturedVideos = filteredVideos.filter((v) => !v.featured);

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      {/* PAGE TITLE */}
      <section className="pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Gallery
        </h1>
        <p className="text-lg md:text-xl text-adinkra-gold/80 max-w-2xl mx-auto px-6">
          Cinematic scoring, sound design, and custom music crafted for visual storytelling.
        </p>
      </section>

      {/* FEATURED VIDEO */}
      {featuredVideo && activeTab === "video" && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-adinkra-highlight mb-10 text-center">
            Featured Work
          </h2>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-adinkra-highlight/20">
              {getEmbedUrl(featuredVideo.youtubeUrl) ? (
                <iframe
                  src={getEmbedUrl(featuredVideo.youtubeUrl)}
                  className="w-full h-full"
                  title={featuredVideo.title || "Featured Video"}
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-red-400 text-sm bg-black">
                  Invalid or missing video URL
                </div>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">
                {featuredVideo.title || "Untitled"}
              </h3>
              <div className="text-adinkra-gold/80 mb-6">
                {renderPortableText(featuredVideo.description) || (
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

      {/* TABS + CATEGORY DROPDOWN */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Tabs */}
          <div className="flex justify-center md:justify-start gap-4">
            <button
              onClick={() => setActiveTab("video")}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                activeTab === "video"
                  ? "bg-adinkra-highlight text-black"
                  : "bg-adinkra-highlight/10 border border-adinkra-highlight/30 hover:bg-adinkra-highlight/30"
              }`}
            >
              🎬 Video Demos
            </button>
            <button
              onClick={() => setActiveTab("audio")}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                activeTab === "audio"
                  ? "bg-adinkra-highlight text-black"
                  : "bg-adinkra-highlight/10 border border-adinkra-highlight/30 hover:bg-adinkra-highlight/30"
              }`}
            >
              🎛 Raw vs Clean Mixes
            </button>
          </div>

          {/* Category Dropdown - Fixed Visibility */}
          <div className="flex items-center gap-3">
            <span className="text-sm uppercase tracking-widest text-adinkra-gold/70 whitespace-nowrap">
              Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-900 border border-adinkra-highlight/50 text-adinkra-gold px-6 py-3 rounded-full focus:outline-none focus:border-adinkra-highlight transition-all cursor-pointer text-base"
            >
              {categories.map((cat) => (
                <option 
                  key={cat.value} 
                  value={cat.value}
                  className="bg-zinc-900 text-adinkra-gold"
                >
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* VIDEO GRID */}
      {activeTab === "video" && (
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
                          <div className="w-full h-full bg-black flex items-center justify-center text-white text-6xl">
                            ▶
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                          <div className="text-white text-5xl">▶</div>
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
              No video demos yet — upload your first in Sanity.
            </p>
          )}
        </section>
      )}

      {/* AUDIO COMPARISON GRID */}
      {activeTab === "audio" && (
        <section className="max-w-7xl mx-auto px-6 pb-24">
          {filteredAudio.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAudio.map((item) => {
                const imageUrl = item.thumbnail?.asset?.url;

                return (
                  <div
                    key={item._id}
                    className="bg-adinkra-highlight/5 border border-adinkra-highlight/20 rounded-2xl overflow-hidden group"
                  >
                    <div className="aspect-video relative">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-black to-zinc-900 flex items-center justify-center">
                          <span className="text-6xl">🎛️</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-black/70 text-xs px-3 py-1 rounded-full">
                        Raw vs Clean
                      </div>
                    </div>

                    <div className="p-6">
                      <h4 className="font-semibold text-lg mb-1">{item.title}</h4>
                      {item.category && (
                        <p className="text-xs text-adinkra-gold/70 mb-5">
                          {item.category.replace("-", " ")}
                        </p>
                      )}

                      {/* Dual Audio Players */}
                      <div className="space-y-5">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-adinkra-gold/60 mb-2">Raw Mix (Pre)</p>
                          {item.rawMixUrl ? (
                            <audio controls className="w-full accent-adinkra-highlight">
                              <source src={item.rawMixUrl} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          ) : (
                            <p className="text-red-400 text-sm">Raw mix missing</p>
                          )}
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-widest text-adinkra-gold/60 mb-2">Clean Mix (Post - Mastered)</p>
                          {item.cleanMixUrl ? (
                            <audio controls className="w-full accent-adinkra-highlight">
                              <source src={item.cleanMixUrl} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          ) : (
                            <p className="text-red-400 text-sm">Clean mix missing</p>
                          )}
                        </div>
                      </div>

                      <Link
                        to="/contact"
                        className="mt-6 block text-center bg-adinkra-highlight text-black font-semibold py-3 px-6 rounded-lg hover:bg-yellow-500 transition"
                      >
                        Hire Me for Similar Work →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-adinkra-gold/70 py-20">
              No mix comparisons yet — create your first "Audio Mix Comparison" in Sanity.
            </p>
          )}
        </section>
      )}
    </div>
  );
}