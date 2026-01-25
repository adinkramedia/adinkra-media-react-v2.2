// src/pages/AdinkraTV.jsx
import { useEffect, useState } from "react";
import { createClient } from "contentful";
import Header from "../components/Header";
import { Link } from "react-router-dom";

const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

const liveChannels = [
  {
    name: "TVC News Nigeria",
    thumb: "/tvc-news-thumb.jpg",
    embedUrl: "https://www.youtube.com/embed/b-Yzp0l8cAM?autoplay=1&mute=0&rel=0",
  },
  {
    name: "Africanews",
    thumb: "/africanews-thumb.jpg",
    embedUrl: "https://www.youtube.com/embed/NQjabLGdP5g?autoplay=1&mute=0&rel=0",
  },
  {
    name: "Arise News",
    thumb: "/arise-news-thumb.jpg",
    embedUrl: "https://www.youtube.com/embed/srJg6ZIPmvU?autoplay=1&mute=0&rel=0",
  },
];

const getEmbedUrl = (url) => {
  if (!url) return "";
  const match = url.match(/(watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[2]}` : url;
};

const plainTextDescription = (richText) =>
  richText?.content
    ?.map((node) => node.content?.[0]?.value || "")
    .join(" ")
    .trim()
    .slice(0, 140);

export default function AdinkraTV() {
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [mobileActiveLiveIndex, setMobileActiveLiveIndex] = useState(null);
  const [desktopActiveLiveIndex, setDesktopActiveLiveIndex] = useState(null);

  useEffect(() => {
    client
      .getEntries({ content_type: "tvVideo" })
      .then((res) => setVideos(res.items))
      .catch(console.error);
  }, []);

  const categories = ["All", "Documentary", "Edutainment", "Film", "Adinkra Original"];

  const filteredVideos =
    selectedCategory === "All"
      ? videos
      : videos.filter(
          (video) =>
            video.fields.category &&
            video.fields.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  const featured = videos.find((video) => video.fields.featured);
  const nonFeaturedVideos = filteredVideos.filter((video) => !video.fields.featured);

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative w-full h-[58vh] sm:h-[65vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center hidden md:block"
          style={{ backgroundImage: "url('/tv-hero-desktop.jpg')" }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center md:hidden"
          style={{ backgroundImage: "url('/tv-hero-mobile.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center text-center px-5 sm:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 drop-shadow-2xl">
            Adinkra TV
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-3xl opacity-95 leading-relaxed mb-4">
            African documentaries, indie films, edutainment, and cultural storytelling.
          </p>
          <p className="text-sm sm:text-base opacity-90 max-w-2xl">
            Watch live African news and explore our growing library of free public domain & Creative Commons content.
          </p>
        </div>
      </section>

      {/* Live African News */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-adinkra-highlight mb-6 sm:mb-9">
          Live African News
        </h2>

        {/* Mobile: Dropdown + single player */}
        <div className="md:hidden space-y-5">
          <div className="relative">
            <select
              value={mobileActiveLiveIndex ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setMobileActiveLiveIndex(val === "" ? null : Number(val));
                setDesktopActiveLiveIndex(null);
              }}
              className="w-full bg-adinkra-card/80 border border-adinkra-highlight/40 text-adinkra-gold rounded-xl px-4 py-3 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-adinkra-highlight"
            >
              <option value="">Select a Live Channel</option>
              {liveChannels.map((ch, idx) => (
                <option key={idx} value={idx}>
                  {ch.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg className="w-5 h-5 text-adinkra-gold/70" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {mobileActiveLiveIndex !== null && (
            <div className="aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border border-adinkra-highlight/30">
              <iframe
                src={liveChannels[mobileActiveLiveIndex].embedUrl}
                className="w-full h-full"
                title={liveChannels[mobileActiveLiveIndex].name}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-9">
          {liveChannels.map((channel, idx) => (
            <div key={idx} className="group">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl relative border border-adinkra-highlight/20">
                {desktopActiveLiveIndex === idx ? (
                  <iframe
                    src={channel.embedUrl}
                    className="w-full h-full"
                    title={channel.name}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div
                    onClick={() => {
                      setDesktopActiveLiveIndex(idx);
                      setMobileActiveLiveIndex(null);
                    }}
                    className="w-full h-full bg-black/70 cursor-pointer flex flex-col items-center justify-center relative group-hover:bg-black/55 transition"
                  >
                    <img
                      src={channel.thumb}
                      alt={channel.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-35 transition-opacity"
                    />
                    <div className="relative z-10 text-center px-4">
                      <div className="bg-red-600 text-white inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-3">
                        LIVE
                      </div>
                      <p className="text-xl font-bold">{channel.name}</p>
                      <p className="text-sm mt-2 opacity-90">Click to watch</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-center mt-4 text-lg font-medium">{channel.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Video */}
      {featured && (
        <section className="max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-adinkra-highlight mb-5 sm:mb-7 text-center">
            Featured
          </h2>
          <div className="aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mb-5 sm:mb-7 border border-adinkra-highlight/20">
            <iframe
              src={getEmbedUrl(featured.fields.youtubeUrl)}
              className="w-full h-full"
              title={featured.fields.title}
              allowFullScreen
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-2">{featured.fields.title}</h3>
          <p className="text-center text-adinkra-gold/80 max-w-3xl mx-auto text-sm sm:text-base">
            {plainTextDescription(featured.fields.description) || "A curated selection from African voices."}
          </p>
        </section>
      )}

      {/* ────────────────────────────────────────────────
          VIDEO LIBRARY – Streaming-style grid
      ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-adinkra-highlight mb-6 sm:mb-9">
          Video Library
        </h2>

        {/* Category selector */}
        <div className="mb-7 sm:mb-10">
          <div className="md:hidden relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-adinkra-card/80 border border-adinkra-highlight/40 text-adinkra-gold rounded-xl px-4 py-3 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-adinkra-highlight"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg className="w-5 h-5 text-adinkra-gold/70" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          <div className="hidden md:flex flex-wrap justify-center gap-3 sm:gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm font-medium transition-all border backdrop-blur-sm ${
                  selectedCategory === cat
                    ? "bg-adinkra-highlight/90 text-adinkra-bg border-adinkra-highlight shadow-md"
                    : "bg-adinkra-highlight/10 text-adinkra-gold border-adinkra-highlight/30 hover:bg-adinkra-highlight/25"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Streaming-style video grid */}
        {nonFeaturedVideos.length > 0 ? (
          <div className="grid gap-4 xs:gap-5 sm:gap-6 grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {nonFeaturedVideos.map((video) => {
              const { title, description, thumbnail, category, premium, youtubeUrl } = video.fields;
              const imageUrl = thumbnail?.fields?.file?.url;
              const excerpt = plainTextDescription(description);

              return (
                <Link
                  key={video.sys.id}
                  to={premium ? `/premium-tv/${video.sys.id}` : `/tv-video/${video.sys.id}`}
                  className="group bg-adinkra-card/70 border border-adinkra-highlight/20 rounded-xl sm:rounded-2xl overflow-hidden hover:border-adinkra-highlight/50 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  <div className="aspect-[4/5] sm:aspect-video relative overflow-hidden flex-shrink-0">
                    {imageUrl ? (
                      <img
                        src={`https:${imageUrl}`}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : youtubeUrl ? (
                      <div className="w-full h-full bg-black/70 flex items-center justify-center">
                        <span className="text-5xl sm:text-6xl text-adinkra-gold/70">▶</span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-black/50 flex items-center justify-center text-adinkra-gold/50 text-sm sm:text-base">
                        No Preview
                      </div>
                    )}
                    {premium && (
                      <span className="absolute top-2 right-2 bg-adinkra-highlight text-adinkra-bg text-xs font-bold px-2 py-1 rounded-full shadow">
                        PREMIUM
                      </span>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <h4 className="text-sm sm:text-base font-semibold line-clamp-2 mb-1 group-hover:text-adinkra-highlight transition-colors">
                      {title}
                    </h4>
                    {category && (
                      <p className="text-xs text-adinkra-gold/70 mb-1 italic line-clamp-1">
                        {category}
                      </p>
                    )}
                    {/* Excerpt hidden on mobile to save space – shows on larger screens */}
                    <p className="hidden sm:block text-xs text-adinkra-gold/65 line-clamp-2">
                      {excerpt || "African story • Documentary"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-adinkra-gold/70 py-12 text-base sm:text-lg">
            No videos found in this category yet.
          </p>
        )}
      </section>
    </div>
  );
}