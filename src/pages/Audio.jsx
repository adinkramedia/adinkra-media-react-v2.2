import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import AccordionFaq from "../components/AccordionFaq";
import WaveformPlayer from "../components/WaveformPlayer";
import { CartProvider, useCart } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";
import { sanity } from "../lib/sanity";
import groq from "groq";

// Simple portable text renderer for Sanity blocks
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

const query = groq`
*[
  _type == "audioTrack" || _type == "album"
] | order(_createdAt desc) {
  _id,
  _type,
  title,
  slug,
  category,

  // audioTrack fields
  trackTitle,
  genre,
  mood,
  bpm,
  duration,
  price,
  freeDownload,

  coverImage {
    asset-> { url }
  },

  // Preview Audio
  previewAudio {
    asset-> { url }
  },
  "previewAudioArray": previewAudio[].asset->url,

  // Full Download for tracks
  fullDownload {
    asset-> { url }
  },

  // Album download links
  downloadUrls[],

  // Album fields
  description,
  affiliateLinks,
  tracks[]->{
    _id,
    title,
    trackTitle
  },
  totalFiles,
  releaseDate,
  packGenre,

  album->{
    title
  }
}
`;

// Licensing FAQs
const licensingFaqs = [
  {
    question: "Can I use these tracks commercially?",
    answer: "Yes. Unless stated otherwise, you may use Adinkra Audio in films, podcasts, games, or educational content with credit.",
  },
  {
    question: "What license do I get when I purchase?",
    answer: "You receive a royalty-free license for life. You're allowed to use it in multiple projects without paying again.",
  },
  {
    question: "What am I NOT allowed to do?",
    answer: "You can't resell or redistribute the raw audio as-is (e.g., upload to stock platforms, remix and sell, etc.).",
  },
];

// Combined category list from both schemas (value → display title)
const allCategories = [
  { value: "All", title: "All" },
  // Audio Tracks
  { value: "music", title: "Music" },
  { value: "scores-cinematic", title: "Scores and Cinematic" },
  { value: "meditation", title: "Meditation" },
  { value: "world-traditional", title: "World and Traditional" },
  { value: "sound-effects", title: "Sound Effects" },
  { value: "ambient", title: "Ambient" },
  // Albums / Packs
  { value: "drum-pack", title: "Drum Pack" },
  { value: "ambient-pack", title: "Ambient Pack" },
  { value: "traditional-instruments", title: "Traditional Instruments" },
  { value: "cinematic-pack", title: "Cinematic Pack" },
  { value: "sound-fx-pack", title: "Sound FX Pack" },
  { value: "synth-pack", title: "Synth Pack" },
  { value: "drum-library", title: "Drum Library" },
];

function AudioContent() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [likes, setLikes] = useState({});
  const [loadingLikes, setLoadingLikes] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartToast, setCartToast] = useState(false);

  const { addToCart, cartItems, clearCart } = useCart();

  // ================= FETCH =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await sanity.fetch(query);
        setItems(data);
        data.forEach((item) => {
          const slug = item.slug?.current || item._id;
          fetchLikeCount(slug);
        });
      } catch (err) {
        console.error("Sanity fetch error:", err);
      }
    };

    fetchData();
  }, []);

  // ================= LIKES =================
  const fetchLikeCount = async (slug) => {
    const { data } = await supabase
      .from("likes")
      .select("count")
      .eq("slug", slug)
      .maybeSingle();

    if (data) {
      setLikes((prev) => ({ ...prev, [slug]: data.count || 0 }));
    }
  };

  const handleLike = async (slug) => {
    setLoadingLikes((prev) => ({ ...prev, [slug]: true }));

    const { data: existing } = await supabase
      .from("likes")
      .select("id, count")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("likes")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);
      setLikes((prev) => ({ ...prev, [slug]: existing.count + 1 }));
    } else {
      await supabase.from("likes").insert({ slug, type: "audio", count: 1 });
      setLikes((prev) => ({ ...prev, [slug]: 1 }));
    }

    setLoadingLikes((prev) => ({ ...prev, [slug]: false }));
  };

  // ================= FILTERING =================
  const filteredItems = items.filter((item) => {
    const f = item;
    if (selectedCategory !== "All" && f.category !== selectedCategory) return false;

    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();
    const genreMatch = Array.isArray(f.genre)
      ? f.genre.some((g) => g.toLowerCase().includes(q))
      : (f.genre || "").toLowerCase().includes(q);

    const moodMatch = Array.isArray(f.mood)
      ? f.mood.some((m) => m.toLowerCase().includes(q))
      : (f.mood || "").toLowerCase().includes(q);

    return (
      (f.trackTitle || f.title || "").toLowerCase().includes(q) ||
      genreMatch ||
      moodMatch
    );
  });

  const singles = filteredItems.filter((item) => item._type === "audioTrack");
  const albums = filteredItems.filter((item) => item._type === "album");

  // ================= ADD TO CART / DOWNLOAD =================
  const handleAddOrDownload = (item) => {
    const f = item;
    const contentType = item._type;
    const isFree = f.freeDownload === true;

    let downloadUrls = [];

    if (contentType === "audioTrack") {
      if (f.fullDownload?.asset?.url) {
        downloadUrls = [f.fullDownload.asset.url];
      }
    } else if (contentType === "album") {
      if (Array.isArray(f.downloadUrls)) {
        downloadUrls = f.downloadUrls.filter(Boolean);
      }
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
        slug: f.slug?.current || item._id,
        title: f.trackTitle || f.title || "Untitled",
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

  // ================= HELPERS =================
  const getTitle = (f) => f.trackTitle || f.title || "Untitled";
  const getCoverUrl = (f) => f.coverImage?.asset?.url || null;

  const getPreviewUrls = (f) => {
    if (f._type === "audioTrack") {
      return f.previewAudio?.asset?.url ? [f.previewAudio.asset.url] : [];
    }
    if (Array.isArray(f.previewAudioArray)) {
      return f.previewAudioArray.filter(Boolean);
    }
    return [];
  };

  const getPriceDisplay = (f) => {
    if (f.freeDownload === true) return "Free";
    const p = Number(f.price);
    return !isNaN(p) ? `$${p.toFixed(2)}` : "—";
  };

  const getMetadata = (f, contentType) => {
    const parts = [];
    if (contentType === "audioTrack") {
      if (Array.isArray(f.genre)) parts.push(...f.genre);
      else if (f.genre) parts.push(f.genre);
      if (Array.isArray(f.mood)) parts.push(...f.mood);
      else if (f.mood) parts.push(f.mood);
      if (f.bpm) parts.push(`${f.bpm} BPM`);
      if (f.duration) parts.push(f.duration);
      if (f.album?.title) parts.push(f.album.title);
    } else {
      if (Array.isArray(f.packGenre)) parts.push(...f.packGenre);
      else if (f.packGenre) parts.push(f.packGenre);
      if (f.category) parts.push(f.category);
      if (f.totalFiles) parts.push(`${f.totalFiles} files`);
      if (Array.isArray(f.tracks)) parts.push(`${f.tracks.length} tracks`);
    }
    return parts.filter(Boolean);
  };

  const getCategoryTitle = (value) => {
    const cat = allCategories.find((c) => c.value === value);
    return cat ? cat.title : value;
  };

  // ================= RENDER =================
  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen flex flex-col w-full">
      <Header />

      {/* HERO */}
      <section className="relative w-full h-[60vh] overflow-hidden">
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          src="/audio-hero-desktop.mp4"
        />
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover md:hidden"
          src="/audio-hero-mobile.mp4"
        />
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-2xl">Adinkra Audio</h1>
          <p className="text-lg md:text-xl max-w-4xl opacity-95 leading-relaxed">
            Explore exclusive scores, loops, and cinematic soundscapes.
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <div className="w-full px-6 mt-10 flex justify-center">
        <input
          type="text"
          placeholder="Search tracks, albums, genres..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-4xl px-5 py-3 rounded-full text-black focus:outline-none"
        />
      </div>

      {/* CATEGORY FILTER */}
      <div className="w-full px-6 mt-8 flex justify-center">
        <details className="w-full max-w-4xl bg-adinkra-highlight/10 border border-adinkra-highlight/30 rounded-lg">
          <summary className="px-6 py-3 font-medium cursor-pointer flex justify-between items-center">
            <span>
              Filter by Category{" "}
              {selectedCategory !== "All" ? `(${getCategoryTitle(selectedCategory)})` : ""}
            </span>
            <span>▼</span>
          </summary>
          <div className="px-6 pb-6 pt-2 flex flex-wrap gap-3">
            {allCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                  cat.value === selectedCategory
                    ? "bg-adinkra-highlight text-adinkra-bg"
                    : "bg-adinkra-highlight/10 border-adinkra-highlight/30 hover:bg-adinkra-highlight/20"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </details>
      </div>

      {/* SINGLE TRACKS SECTION */}
      <section className="w-full px-6 mt-12">
        <h2 className="text-3xl font-bold mb-6 text-center md:text-left">Single Tracks</h2>
        {singles.length === 0 ? (
          <p className="text-center opacity-70">No tracks found in this category.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {singles.map((item) => {
              const f = item;
              const slug = f.slug?.current || item._id;
              const cover = getCoverUrl(f);
              const previewUrls = getPreviewUrls(f);
              const preview = previewUrls[0] || null;
              const priceStr = getPriceDisplay(f);
              const meta = getMetadata(f, "audioTrack");

              return (
                <div
                  key={slug}
                  className="flex flex-col md:flex-row items-center gap-6 border-b border-adinkra-highlight/20 pb-6"
                >
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={cover || "/placeholder.jpg"}
                      alt={getTitle(f)}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>

                  <div className="flex flex-col w-full md:w-80">
                    <div className="font-semibold text-lg">{getTitle(f)}</div>
                    <div className="text-xs opacity-70 mt-1 flex flex-wrap gap-3">
                      {meta.map((m, i) => <span key={i}>{m}</span>)}
                    </div>
                  </div>

                  <div className="flex-1 w-full min-h-[40px]">
                    {preview ? (
                      <WaveformPlayer audioUrl={preview} />
                    ) : (
                      <div className="h-10 flex items-center justify-center bg-black/30 rounded text-sm opacity-70 italic">
                        No preview available
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="font-bold text-lg">{priceStr}</span>
                    <button
                      onClick={() => handleLike(slug)}
                      disabled={loadingLikes[slug]}
                      className="bg-adinkra-highlight/15 px-3 py-1 rounded"
                    >
                      ♡ {likes[slug] || 0}
                    </button>
                    <button
                      onClick={() => handleAddOrDownload(item)}
                      className="bg-adinkra-highlight px-5 py-2.5 rounded hover:bg-yellow-500 text-adinkra-bg font-medium"
                    >
                      {f.freeDownload ? "Download" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SAMPLE PACKS / ALBUMS SECTION */}
      <section className="w-full px-6 mt-16">
        <h2 className="text-3xl font-bold mb-6 text-center md:text-left">Collections</h2>
        {albums.length === 0 ? (
          <p className="text-center opacity-70">No packs found in this category.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {albums.map((item) => {
              const f = item;
              const slug = f.slug?.current || item._id;
              const cover = getCoverUrl(f);
              const previewUrls = getPreviewUrls(f);
              const priceStr = getPriceDisplay(f);
              const meta = getMetadata(f, "album");
              const isFree = f.freeDownload === true;

              return (
                <details
                  key={slug}
                  className="bg-black/20 rounded-xl border border-adinkra-highlight/30 overflow-hidden"
                >
                  <summary className="px-6 py-5 cursor-pointer flex flex-col md:flex-row md:items-center gap-4 md:gap-6 hover:bg-black/30 transition-colors">
                    <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                      <img
                        src={cover || "/placeholder.jpg"}
                        alt={getTitle(f)}
                        className="w-full h-full object-cover rounded-lg shadow"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-bold">{getTitle(f)}</h3>
                          <span className="inline-block mt-1 text-xs bg-adinkra-highlight text-black px-2.5 py-1 rounded-full">
                            SAMPLE PACK
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{priceStr}</div>
                          {isFree && <div className="text-sm text-green-400">Free</div>}
                        </div>
                      </div>
                      <div className="mt-2 text-sm opacity-80 flex flex-wrap gap-3">
                        {meta.map((m, i) => (
                          <span key={i} className="bg-black/30 px-3 py-1 rounded">
                            {m}
                          </span>
                        ))}
                        {f.releaseDate && (
                          <span className="bg-black/30 px-3 py-1 rounded">
                            Released: {new Date(f.releaseDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </summary>

                  <div className="px-6 pb-6 pt-2 border-t border-adinkra-highlight/20">
                    <div className="flex flex-col gap-8">
                      {previewUrls.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 text-lg">Previews</h4>
                          <div className="space-y-6">
                            {previewUrls.map((url, idx) => (
                              <WaveformPlayer key={idx} audioUrl={url} />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                          <div className="text-lg font-semibold">Price</div>
                          <div className="text-3xl font-bold">{priceStr}</div>
                          {isFree && <div className="text-green-400">Free Download</div>}
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleLike(slug)}
                            disabled={loadingLikes[slug]}
                            className="bg-adinkra-highlight/30 px-5 py-2.5 rounded"
                          >
                            ♡ {likes[slug] || 0}
                          </button>
                          <button
                            onClick={() => handleAddOrDownload(item)}
                            className="bg-adinkra-highlight px-6 py-2.5 rounded hover:bg-yellow-500 text-adinkra-bg font-medium"
                          >
                            {isFree ? "Download Now" : "Add to Cart"}
                          </button>
                        </div>
                      </div>

                      {f.description && (
                        <div className="prose prose-invert max-w-none">
                          <h4 className="font-semibold text-lg mb-3">Description</h4>
                          {renderPortableText(f.description)}
                        </div>
                      )}

                      {Array.isArray(f.tracks) && f.tracks.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-lg mb-3">
                            Tracks Included ({f.tracks.length})
                          </h4>
                          <ul className="list-disc pl-6 space-y-1.5 text-sm opacity-90">
                            {f.tracks.map((track, idx) => (
                              <li key={idx}>
                                {track.trackTitle || track.title || `Track ${idx + 1}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {f.affiliateLinks && (
                        <div className="prose prose-invert max-w-none">
                          <h4 className="font-semibold text-lg mb-3">More Info / Affiliates</h4>
                          {renderPortableText(f.affiliateLinks)}
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </section>

      {/* FAQ */}
      <div className="mt-16 mb-16 w-full px-6 flex justify-center">
        <div className="w-full max-w-4xl">
          <AccordionFaq title="Adinkra Audio Licensing FAQ" faqs={licensingFaqs} />
        </div>
      </div>

      {cartToast && (
        <div className="fixed bottom-24 right-6 bg-adinkra-highlight text-adinkra-bg px-5 py-3 rounded-xl shadow-xl font-semibold animate-bounce z-50">
          ✓ Added to Cart
        </div>
      )}

      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 bg-adinkra-highlight text-adinkra-bg px-6 py-3 rounded-full shadow-xl font-semibold"
      >
        🛒 Cart ({cartItems.length})
      </button>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </div>
  );
}

export default function Audio() {
  return (
    <CartProvider>
      <AudioContent />
    </CartProvider>
  );
}