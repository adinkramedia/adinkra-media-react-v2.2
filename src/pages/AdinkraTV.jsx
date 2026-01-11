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
    .slice(0, 180);

export default function AdinkraTV() {
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeLive, setActiveLive] = useState({});

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
      <section className="relative w-full h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center hidden md:block"
          style={{ backgroundImage: "url('/tv-hero-desktop.jpg')" }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center md:hidden"
          style={{ backgroundImage: "url('/tv-hero-mobile.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-2xl">
            Adinkra TV
          </h1>
          <p className="text-lg md:text-xl max-w-3xl opacity-95 leading-relaxed mb-6">
            African documentaries, indie films, edutainment, and cultural storytelling.
          </p>
          <p className="text-base opacity-90 max-w-2xl">
            Watch live African news and explore our growing library of free public domain & Creative Commons content.
          </p>
        </div>
      </section>

      {/* Live African News Streams */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-adinkra-highlight mb-10">
          Live African News
        </h2>

        {/* Desktop */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-10">
          {liveChannels.map((channel, idx) => (
            <div key={idx} className="group">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl relative">
                {activeLive[idx] ? (
                  <iframe
                    src={channel.embedUrl}
                    className="w-full h-full"
                    title={channel.name}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div
                    onClick={() => setActiveLive({ ...activeLive, [idx]: true })}
                    className="w-full h-full bg-black/70 cursor-pointer flex flex-col items-center justify-center relative group-hover:bg-black/60 transition"
                  >
                    <img
                      src={channel.thumb}
                      alt={channel.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-50"
                    />
                    <div className="relative z-10 text-center">
                      <div className="bg-red-600 text-white inline-block px-4 py-2 rounded-full text-sm font-bold mb-4">
                        LIVE
                      </div>
                      <p className="text-2xl font-bold">{channel.name}</p>
                      <p className="text-sm mt-3 opacity-90">Click to watch</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-center mt-5 text-xl font-medium">{channel.name}</p>
            </div>
          ))}
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-8">
          {liveChannels.map((channel, idx) => (
            <div key={idx}>
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl relative">
                {activeLive[idx] ? (
                  <iframe
                    src={channel.embedUrl}
                    className="w-full h-full"
                    title={channel.name}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div
                    onClick={() => setActiveLive({ ...activeLive, [idx]: true })}
                    className="w-full h-full bg-black/70 cursor-pointer flex flex-col items-center justify-center"
                  >
                    <img
                      src={channel.thumb}
                      alt={channel.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-50"
                    />
                    <div className="relative z-10 text-center">
                      <div className="bg-red-600 text-white inline-block px-4 py-2 rounded-full text-sm font-bold mb-3">
                        LIVE
                      </div>
                      <p className="text-xl font-bold">{channel.name}</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-center mt-4 text-lg font-medium">{channel.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Video (from Contentful) */}
      {featured && (
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-adinkra-highlight mb-8 text-center">
            Featured
          </h2>
          <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl mb-8">
            <iframe
              src={getEmbedUrl(featured.fields.youtubeUrl)}
              className="w-full h-full"
              title={featured.fields.title}
              allowFullScreen
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          <h3 className="text-2xl font-bold text-center mb-3">{featured.fields.title}</h3>
          <p className="text-center text-adinkra-gold/80 max-w-3xl mx-auto">
            {plainTextDescription(featured.fields.description) || "A curated selection from African voices."}
          </p>
        </section>
      )}

      {/* Video Library – Pulled from Contentful */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center text-adinkra-highlight mb-10">
          Video Library
        </h2>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all border backdrop-blur-sm ${
                selectedCategory === cat
                  ? "bg-adinkra-highlight/90 text-adinkra-bg border-adinkra-highlight shadow-md"
                  : "bg-adinkra-highlight/10 text-adinkra-gold border-adinkra-highlight/30 hover:bg-adinkra-highlight/25"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        {nonFeaturedVideos.length > 0 ? (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {nonFeaturedVideos.map((video) => {
              const { title, description, thumbnail, category, premium, youtubeUrl } = video.fields;
              const imageUrl = thumbnail?.fields?.file?.url;
              const excerpt = plainTextDescription(description);

              return (
                <Link
                  key={video.sys.id}
                  to={premium ? `/premium-tv/${video.sys.id}` : `/tv-video/${video.sys.id}`}
                  className="group bg-adinkra-card/90 border border-adinkra-highlight/20 rounded-3xl overflow-hidden hover:-translate-y-2 hover:border-adinkra-highlight/50 hover:shadow-2xl transition-all duration-500"
                >
                  <div className="aspect-video relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={`https:${imageUrl}`}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : youtubeUrl ? (
                      <div className="w-full h-full bg-black/50 flex items-center justify-center">
                        <span className="text-5xl">▶</span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-black/40 flex items-center justify-center text-adinkra-gold/50">
                        No Preview
                      </div>
                    )}
                    {premium && (
                      <span className="absolute top-4 right-4 bg-adinkra-highlight text-adinkra-bg text-xs px-3 py-1 rounded-full font-bold">
                        PREMIUM
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-2 line-clamp-2">{title}</h4>
                    {category && <p className="text-sm italic text-adinkra-gold/60 mb-2">{category}</p>}
                    <p className="text-sm text-adinkra-gold/80 line-clamp-3">{excerpt}...</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-adinkra-gold/70 py-12">
            No videos in this category yet.
          </p>
        )}
      </section>

      {/* Call to Indie Filmmakers – Revenue Share */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center bg-adinkra-card/60 backdrop-blur-md border border-adinkra-highlight/40 rounded-3xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Filmmakers Wanted</h2>
        <p className="text-lg md:text-xl leading-relaxed text-adinkra-gold/90 mb-8 max-w-3xl mx-auto">
          Are you an independent African filmmaker with a completed documentary, short film, or series?
        </p>
        <p className="text-lg leading-relaxed text-adinkra-gold/90 mb-10 max-w-3xl mx-auto">
          We’re building a platform to showcase authentic African stories. If your work is ready, we offer revenue sharing on premium streams and subscriptions.
        </p>
        <Link
          to="/contact"
          className="inline-block bg-adinkra-highlight text-adinkra-bg font-semibold text-lg px-10 py-4 rounded-full hover:bg-yellow-500 transition shadow-lg"
        >
          Submit Your Film
        </Link>
      </section>
    </div>
  );
}