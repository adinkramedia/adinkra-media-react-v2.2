import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import groq from "groq";
import { sanity } from "../lib/sanity";
import { CartProvider, useCart } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";

// Standalone Audio Player (copied from Audio.jsx for consistency)
function StandaloneAudioPlayer({ audioUrl }) {
  const audioRef = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      document.querySelectorAll("audio").forEach((a) => {
        if (a !== audio) {
          a.pause();
          a.currentTime = 0;
        }
      });
      audio.play().then(() => setIsPlaying(true)).catch((e) => console.log("Play failed:", e));
    }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  return (
    <div className="w-full flex items-center gap-3 bg-zinc-950/50 p-4 rounded-xl">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <button
        onClick={togglePlay}
        disabled={!isLoaded}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isPlaying
            ? "bg-adinkra-highlight text-adinkra-bg"
            : "bg-adinkra-gold/20 text-adinkra-gold hover:bg-adinkra-highlight hover:text-adinkra-bg"
        } ${!isLoaded ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex-1">
        <div
          className="h-1.5 bg-white/10 rounded-full cursor-pointer relative overflow-hidden"
          onClick={seek}
        >
          <div
            className="absolute top-0 left-0 h-full bg-adinkra-highlight rounded-full transition-all"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
          />
        </div>
      </div>

      <span className="text-xs text-adinkra-gold/60 font-mono whitespace-nowrap">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}

const query = groq`
*[
  (_type == "audioTrack" || _type == "album")
  && slug.current == $slug
][0]{
  _id,
  _type,
  title,
  slug,
  category,
  genre,
  mood,
  packGenre,
  price,
  freeDownload,
  description,
  affiliateLinks,
  releaseDate,
  totalFiles,

  contributor->{
    name,
    slug,
    verified
  },

  coverImage{
    asset->{url}
  },

  previewAudio{
    asset->{url}
  },

  "previewAudioArray": previewAudio[].asset->url,

  fullDownload{
    asset->{url}
  },

  downloadUrls[],

  tracks[]->{
    _id,
    title,
    duration,
    bpm
  }
}
`;

const renderPortableText = (blocks) => {
  if (!blocks || !Array.isArray(blocks)) return null;

  return blocks.map((block, index) => {
    if (block._type === "block") {
      return (
        <p
          key={block._key || index}
          className="mb-4 text-adinkra-gold/80 leading-relaxed"
        >
          {block.children?.map((child) => child.text).join(" ")}
        </p>
      );
    }
    return null;
  });
};

function AudioItemContent() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartToast, setCartToast] = useState(false);

  const { addToCart, cartItems, clearCart } = useCart();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await sanity.fetch(query, { slug });
        setItem(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [slug]);

  const handleAddOrDownload = () => {
    if (!item) return;

    const f = item;
    const isFree = f.freeDownload === true;
    let downloadUrls = [];

    if (f._type === "audioTrack") {
      if (f.fullDownload?.asset?.url) downloadUrls = [f.fullDownload.asset.url];
    } else if (f._type === "album") {
      if (Array.isArray(f.downloadUrls)) downloadUrls = f.downloadUrls.filter(Boolean);
    }

    if (downloadUrls.length === 0) {
      alert("No download file available for this item.");
      return;
    }

    if (isFree) {
      downloadUrls.forEach((url) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = "";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } else {
      const priceValue = Number(f.price ?? 0);
      const finalPrice = isNaN(priceValue) ? 0 : priceValue;

      addToCart({
        slug: f.slug?.current || f._id,
        title: f.title || "Untitled",
        price: finalPrice,
        downloadUrls,
      });

      setCartToast(true);
      setTimeout(() => setCartToast(false), 2000);
    }
  };

  const handlePurchaseComplete = () => {
    const purchasedSlugs = cartItems.map((item) => item.slug);
    clearCart();
    navigate(`/downloads?slugs=${purchasedSlugs.join(",")}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Item not found.
      </div>
    );
  }

  const cover = item.coverImage?.asset?.url || "/placeholder.jpg";
  const priceDisplay = item.freeDownload
    ? "Free"
    : `$${Number(item.price || 0).toFixed(2)}`;

  const previewUrl = item.previewAudio?.asset?.url;
  const previewUrls = item.previewAudioArray || (previewUrl ? [previewUrl] : []);

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      {/* HERO */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <img
          src={cover}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-end pb-16">
          <div>
            <div className="text-adinkra-highlight text-sm uppercase tracking-widest mb-3">
              {item._type === "album" ? "Sample Pack" : "Audio Track"}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              {item.title}
            </h1>
            <p className="mt-4 text-adinkra-gold/70">
              {item.contributor?.name || "Adinkra Media"}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full bg-white/10">
                {item.category}
              </span>
              {item.price && (
                <span className="px-4 py-2 rounded-full bg-adinkra-highlight text-black font-bold">
                  ${item.price}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AUDIO PREVIEW SECTION */}
      {previewUrls.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
          <div className="bg-zinc-900/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/10">
            <h3 className="text-lg font-semibold mb-4 text-adinkra-gold">Preview</h3>
            <div className="space-y-4">
              {previewUrls.map((url, idx) => (
                <StandaloneAudioPlayer key={idx} audioUrl={url} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Description</h2>
            {renderPortableText(item.description)}
          </div>

          <div>
            <div className="sticky top-28 bg-zinc-900 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">Purchase</h3>
              <div className="text-3xl font-bold text-adinkra-highlight mb-6">
                {priceDisplay}
              </div>
              <button
                onClick={handleAddOrDownload}
                className="w-full py-3 rounded-xl bg-adinkra-highlight text-black font-bold hover:bg-yellow-400 transition-colors"
              >
                {item.freeDownload ? "Download" : "Add To Cart"}
              </button>
            </div>
          </div>
        </div>

        {/* TRACKS */}
        {item._type === "album" && item.tracks?.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Tracks Included</h2>
            <div className="space-y-3">
              {item.tracks.map((track, index) => (
                <div
                  key={track._id}
                  className="bg-zinc-900 rounded-xl p-4 flex justify-between"
                >
                  <span>
                    {index + 1}. {track.title}
                  </span>
                  <span className="text-adinkra-gold/50">
                    {track.duration}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Cart Toast */}
      {cartToast && (
        <div className="fixed bottom-24 right-4 bg-adinkra-highlight text-adinkra-bg px-4 py-3 rounded-xl shadow-2xl font-semibold z-50 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Added to Cart
        </div>
      )}

      {/* Floating Cart Button */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 bg-adinkra-highlight hover:bg-yellow-400 text-adinkra-bg p-4 rounded-full shadow-2xl font-semibold flex items-center gap-2 transition-all z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {cartItems.length}
          </span>
        )}
      </button>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </div>
  );
}

export default function AudioItemPage() {
  return (
    <CartProvider>
      <AudioItemContent />
    </CartProvider>
  );
}