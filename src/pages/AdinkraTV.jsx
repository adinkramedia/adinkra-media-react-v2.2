// src/pages/AdinkraTV.jsx

import { useEffect, useState } from "react";
import { createClient } from "contentful";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const SPACE_ID = "8e41pkw4is56";
const ACCESS_TOKEN = "qM0FzdQIPkX6VF4rt8wXzzLiPdgbjmmNGzHarCK0l8I";
const client = createClient({ space: SPACE_ID, accessToken: ACCESS_TOKEN });

const liveChannels = [
  {
    name: "TVC News",
    thumb: "/tvc-news-thumb.jpg",
    embedUrl: "https://www.youtube.com/embed/b-Yzp0l8cAM?si=lGq1-hez6eAHhuEq",
  },
  {
    name: "Africanews",
    thumb: "/africanews-thumb.jpg",
    embedUrl: "https://www.youtube.com/embed/NQjabLGdP5g?si=3yzGWlHyOENxTdRv",
  },
  {
    name: "Arise News",
    thumb: "/arise-news-thumb.jpg",
    embedUrl: "https://www.youtube.com/embed/srJg6ZIPmvU?si=7StqTVvIN_CGVzCM",
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
    .trim();

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

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative w-full h-[70vh] bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center hidden md:block"
          style={{ backgroundImage: "url('/tv-hero-desktop.jpg')" }}
        />
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center md:hidden"
          style={{ backgroundImage: "url('/tv-hero-mobile.jpg')" }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full bg-black/60 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Adinkra TV</h1>
          <p className="text-adinkra-gold/80 max-w-2xl mx-auto text-lg mb-4">
            African documentaries, edutainment, indie films, and original content — streaming for the next generation.
          </p>
          <Link
            to="/premium-tv"
            className="bg-adinkra-card border border-adinkra-highlight hover:bg-adinkra-highlight/30 text-adinkra-gold/80 px-4 py-2 rounded-full text-sm font-medium transition"
          >
            Explore Premium Videos
          </Link>
        </div>
      </section>

      {/* 🔴 Live Channels */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold mb-6 text-adinkra-highlight">Live News</h2>

        {/* Mobile Scroll */}
        <div className="md:hidden flex overflow-x-auto gap-4 pb-4">
          {liveChannels.map((channel, idx) => (
            <div key={idx} className="min-w-[280px]">
              <div className="rounded-lg overflow-hidden mb-2 relative aspect-video">
                {activeLive[idx] ? (
                  <iframe
                    src={channel.embedUrl}
                    className="w-full h-full border-none"
                    title={channel.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div
                    className="w-full h-full bg-black cursor-pointer"
                    onClick={() => setActiveLive({ ...activeLive, [idx]: true })}
                  >
                    <img
                      src={channel.thumb}
                      alt={channel.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      LIVE
                    </div>
                  </div>
                )}
              </div>
              <p className="text-center text-sm font-medium">{channel.name}</p>
            </div>
          ))}
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {liveChannels.map((channel, idx) => (
            <div key={idx}>
              <div className="aspect-video rounded-lg overflow-hidden mb-2 relative">
                {activeLive[idx] ? (
                  <iframe
                    src={channel.embedUrl}
                    className="w-full h-full border-none"
                    title={channel.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div
                    className="w-full h-full bg-black cursor-pointer"
                    onClick={() => setActiveLive({ ...activeLive, [idx]: true })}
                  >
                    <img
                      src={channel.thumb}
                      alt={channel.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      LIVE
                    </div>
                  </div>
                )}
              </div>
              <p className="text-center text-sm font-medium">{channel.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🌟 Featured */}
      {featured && (
        <section className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-semibold mb-4 text-adinkra-highlight">Featured</h2>
          <div className="aspect-video w-full rounded-lg overflow-hidden mb-4">
            <iframe
              src={getEmbedUrl(featured.fields.youtubeUrl)}
              allowFullScreen
              className="w-full h-full border-none"
              title={featured.fields.title || "Featured Video"}
            />
          </div>
          <h3 className="text-xl font-bold">{featured.fields.title || "No Title"}</h3>
          <p className="text-adinkra-gold/80 text-sm mt-1">
            {plainTextDescription(featured.fields.description) || "No description available."}
          </p>
        </section>
      )}

      {/* 🎯 Filter & Videos */}
      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === cat
                  ? "bg-adinkra-highlight text-adinkra-bg"
                  : "bg-adinkra-card text-adinkra-gold/70 hover:bg-adinkra-highlight/30"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVideos
            .filter((video) => !video.fields.featured)
            .map((video) => {
              const { title, description, thumbnail, category, premium } = video.fields;
              const imageUrl = thumbnail?.fields?.file?.url;
              const excerpt = plainTextDescription(description).slice(0, 150);

              return (
                <Link
                  key={video.sys.id}
                  to={premium ? `/premium-tv/${video.sys.id}` : `/tv-video/${video.sys.id}`}
                  className="bg-adinkra-card border border-adinkra-highlight rounded-lg p-4 shadow-md hover:shadow-xl transition duration-300"
                >
                  <div className="aspect-video rounded overflow-hidden mb-3">
                    {imageUrl ? (
                      <img
                        src={`https:${imageUrl}`}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-black w-full h-full flex items-center justify-center text-adinkra-gold/50 text-sm">
                        No Thumbnail
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold mb-1">{title}</h4>
                  <p className="text-sm italic text-adinkra-gold/70 mb-1">{category}</p>
                  <p className="text-sm text-adinkra-gold/80">{excerpt}...</p>
                  {premium && (
                    <p className="text-xs mt-1 text-adinkra-highlight font-semibold uppercase">
                      Premium
                    </p>
                  )}
                </Link>
              );
            })}
        </div>
      </section>

      
    </div>
  );
}
