import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { createClient } from "contentful";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SPACE_ID = "8e41pkw4is56";
const ACCESS_TOKEN = "qM0FzdQIPkX6VF4rt8wXzzLiPdgbjmmNGzHarCK0l8I";

const client = createClient({ space: SPACE_ID, accessToken: ACCESS_TOKEN });

const getEmbedUrl = (url) => {
  if (!url) return "";
  const watchMatch = url.match(/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return url;
};

const plainTextDescription = (richText) => {
  return richText?.content
    ?.map((node) => node.content?.[0]?.value || "")
    .join(" ")
    .trim();
};

export default function PremiumVideo() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .getEntry(id)
      .then((entry) => {
        setVideo(entry);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-adinkra-gold text-center mt-20">Loading...</div>;

  if (!video)
    return (
      <div className="text-adinkra-gold text-center mt-20">
        Video not found.
        <div className="mt-4">
          <Link to="/premium-tv" className="text-adinkra-highlight hover:underline">
            ← Back to Premium Videos
          </Link>
        </div>
      </div>
    );

  const { title, description, youtubeUrl, thumbnail, category } = video.fields;

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen flex flex-col">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12 flex-grow">
        <h1 className="text-4xl font-bold mb-6">{title}</h1>

        <div className="aspect-video w-full rounded-lg overflow-hidden mb-6">
          <iframe
            src={getEmbedUrl(youtubeUrl)}
            allowFullScreen
            className="w-full h-full border-none"
            title={title}
          />
        </div>

        <p className="italic text-adinkra-gold/70 mb-4">{category}</p>

        <p className="text-adinkra-gold/80 whitespace-pre-line">
          {plainTextDescription(description)}
        </p>

        <div className="mt-8">
          <Link to="/premium-tv" className="text-adinkra-highlight hover:underline">
            ← Back to Premium Videos
          </Link>
        </div>
      </main>

      
    </div>
  );
}
