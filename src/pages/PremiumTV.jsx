// src/pages/PremiumTV.jsx
import { useEffect, useState } from "react";
import { createClient } from "contentful";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

// ✅ Use Vite env variables instead of hardcoded keys
const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

const plainTextDescription = (richText) => {
  return richText?.content
    ?.map((node) => node.content?.[0]?.value || "")
    .join(" ")
    .trim();
};

export default function PremiumTV() {
  const [premiumVideos, setPremiumVideos] = useState([]);

  useEffect(() => {
    client
      .getEntries({
        content_type: "tvVideo",
        "fields.premium": true,
      })
      .then((res) => setPremiumVideos(res.items))
      .catch(console.error);
  }, []);

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Premium Videos</h1>
          <Link
            to="/adinkra-tv"
            className="text-sm text-adinkra-highlight hover:underline"
          >
            ← Back to Adinkra TV
          </Link>
        </div>

        <p className="text-adinkra-gold/70 mb-6">
          Exclusive Adinkra Originals and contributor content — available to supporters and subscribers.
        </p>

        {premiumVideos.length === 0 ? (
          <p className="text-adinkra-gold/50 italic">No premium videos available yet.</p>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {premiumVideos.map((video) => {
              const { title, description, thumbnail, category } = video.fields;
              const imageUrl = thumbnail?.fields?.file?.url;
              const excerpt = plainTextDescription(description).slice(0, 150);

              return (
                <Link
                  to={`/premium-tv/${video.sys.id}`}
                  key={video.sys.id}
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
                  <p className="text-xs mt-1 text-adinkra-highlight font-semibold uppercase">
                    Premium
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
