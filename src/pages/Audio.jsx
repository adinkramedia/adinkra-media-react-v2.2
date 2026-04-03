import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import AccordionFaq from "../components/AccordionFaq";
import WaveformPlayer from "../components/WaveformPlayer";
import { CartProvider, useCart } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";
import { sanity } from "../lib/sanity";
import groq from "groq";

// Lazy Waveform Player - only loads when expanded and in view
function LazyWaveformPlayer({ audioUrl, ...props }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!isVisible) {
    return (
      <div
        ref={containerRef}
        className="h-14 bg-zinc-900/80 rounded-2xl flex items-center px-6 overflow-hidden relative border border-white/5"
      >
        <div className="flex items-end gap-[3px] w-full h-8">
          {Array.from({ length: 65 }).map((_, i) => (
            <div
              key={i}
              className="bg-adinkra-gold/40 w-[2.5px] rounded-full animate-pulse"
              style={{
                height: `${30 + Math.random() * 70}%`,
                animationDelay: `-${Math.random() * 1.6}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-xs opacity-40 font-mono tracking-[2px]">
          WAVEFORM
        </div>
      </div>
    );
  }

  return <WaveformPlayer audioUrl={audioUrl} {...props} />;
};

// Simple portable text renderer
const renderPortableText = (blocks) => {
  if (!blocks || !Array.isArray(blocks)) return null;
  return blocks.map((block, index) => {
    if (block._type === "block") {
      return (
        <p key={block._key || index} className="mb-4 text-adinkra-gold/80 leading-relaxed">
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
  trackTitle,
  genre,
  mood,
  bpm,
  duration,
  price,
  freeDownload,
  coverImage { asset-> { url } },
  previewAudio { asset-> { url } },
  "previewAudioArray": previewAudio[].asset->url,
  fullDownload { asset-> { url } },
  downloadUrls[],
  description,
  affiliateLinks,
  tracks[]->{ _id, title, trackTitle },
  totalFiles,
  releaseDate,
  packGenre,
  album->{ title }
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

// Categories
const allCategories = [
  { value: "All", title: "All" },
  { value: "music", title: "Music" },
  { value: "scores-cinematic", title: "Scores and Cinematic" },
  { value: "meditation", title: "Meditation" },
  { value: "world-traditional", title: "World and Traditional" },
  { value: "sound-effects", title: "Sound Effects" },
  { value: "ambient", title: "Ambient" },
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

  // Fetch data
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

  const fetchLikeCount = async (slug) => {
    const { data } = await supabase
      .from("likes")
      .select("count")
      .eq("slug", slug)
      .maybeSingle();
    if (data) setLikes((prev) => ({ ...prev, [slug]: data.count || 0 }));
  };

  const handleLike = async (slug) => {
    setLoadingLikes((prev) => ({ ...prev, [slug]: true }));
    const { data: existing } = await supabase
      .from("likes")
      .select("id, count")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      await supabase.from("likes").update({ count: existing.count + 1 }).eq("id", existing.id);
      setLikes((prev) => ({ ...prev, [slug]: existing.count + 1 }));
    } else {
      await supabase.from("likes").insert({ slug, type: "audio", count: 1 });
      setLikes((prev) => ({ ...prev, [slug]: 1 }));
    }
    setLoadingLikes((prev) => ({ ...prev, [slug]: false }));
  };

  // Filtering
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

  const handleAddOrDownload = (item) => {
    const f = item;
    const contentType = item._type;
    const isFree = f.freeDownload === true;

    let downloadUrls = [];
    if (contentType === "audioTrack") {
      if (f.fullDownload?.asset?.url) downloadUrls = [f.fullDownload.asset.url];
    } else if (contentType === "album") {
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

  const getTitle = (f) => f.trackTitle || f.title || "Untitled";
  const getCoverUrl = (f) => f.coverImage?.asset?.url || "/placeholder.jpg";

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

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      {/* Premium Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/audio-hero-desktop.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-adinkra-bg" />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-4">
            Adinkra <span className="text-adinkra-highlight">Audio</span>
          </h1>
          <p className="text-xl md:text-2xl text-adinkra-gold/70">
            Premium royalty-free music & cinematic soundscapes
          </p>
        </div>
      </section>

      {/* Sticky Controls */}
      <div className="sticky top-0 z-40 bg-adinkra-bg/95 backdrop-blur-lg border-b border-adinkra-highlight/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by title, genre, mood..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-zinc-900 border border-white/10 focus:border-adinkra-highlight rounded-2xl px-6 py-4 text-lg placeholder:text-adinkra-gold/40 focus:outline-none transition-all"
          />

          <details className="md:w-80 bg-zinc-900 border border-white/10 rounded-2xl">
            <summary className="px-6 py-4 cursor-pointer flex justify-between items-center text-lg">
              {getCategoryTitle(selectedCategory)}
              <span>▼</span>
            </summary>
            <div className="p-4 grid grid-cols-2 gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-5 py-3 rounded-xl text-left transition-all ${
                    cat.value === selectedCategory
                      ? "bg-adinkra-highlight text-black font-medium"
                      : "hover:bg-white/5"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* SINGLE TRACKS */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-4xl font-bold tracking-tight">Single Tracks</h2>
            <span className="text-adinkra-gold/60 text-lg font-light">{singles.length} tracks</span>
          </div>

          {singles.length === 0 ? (
            <p className="text-center py-20 text-adinkra-gold/50">No tracks found in this category.</p>
          ) : (
            <div className="space-y-6">
              {singles.map((item) => {
                const f = item;
                const slug = f.slug?.current || item._id;
                const cover = getCoverUrl(f);
                const preview = getPreviewUrls(f)[0] || null;
                const priceStr = getPriceDisplay(f);
                const meta = getMetadata(f, "audioTrack");

                return (
                  <details
                    key={slug}
                    className="group bg-zinc-900/80 border border-white/10 hover:border-adinkra-highlight/40 rounded-3xl overflow-hidden transition-all duration-300 shadow-sm"
                  >
                    <summary className="px-8 py-8 cursor-pointer flex flex-col md:flex-row md:items-center gap-6 hover:bg-white/5 transition-all list-none">
                      <div className="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10">
                        <img
                          src={cover}
                          alt={getTitle(f)}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-semibold group-hover:text-adinkra-highlight transition-colors tracking-tight">
                          {getTitle(f)}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {meta.map((m, i) => (
                            <span key={i} className="text-xs uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right md:text-left flex-shrink-0">
                        <div className="text-3xl font-bold text-adinkra-highlight tabular-nums">{priceStr}</div>
                      </div>
                    </summary>

                    <div className="px-8 pb-10 border-t border-white/10 bg-zinc-950/50">
                      <div className="pt-8">
                        {preview ? (
                          <div className="mb-10">
                            <h4 className="uppercase tracking-[3px] text-xs text-adinkra-gold/60 mb-4 font-mono">PREVIEW</h4>
                            <LazyWaveformPlayer audioUrl={preview} />
                          </div>
                        ) : (
                          <div className="h-14 flex items-center justify-center bg-zinc-950 rounded-2xl text-sm opacity-60 border border-white/5">
                            No preview available
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-6 justify-between items-center pt-8 border-t border-white/10">
                          <div>
                            <div className="text-sm text-adinkra-gold/60">Price</div>
                            <div className="text-4xl font-bold tabular-nums">{priceStr}</div>
                          </div>

                          <div className="flex gap-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleLike(slug); }}
                              disabled={loadingLikes[slug]}
                              className="px-8 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-3 transition-all text-sm font-medium"
                            >
                              ♡ <span className="tabular-nums">{likes[slug] || 0}</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAddOrDownload(item); }}
                              className="px-10 py-3.5 bg-adinkra-highlight hover:bg-yellow-400 active:bg-yellow-500 text-black font-semibold rounded-2xl transition-all shadow-sm"
                            >
                              {f.freeDownload ? "Download Now" : "Add to Cart"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>

        {/* COLLECTIONS & SAMPLE PACKS - EXCLUSIVE ACCORDION */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-4xl font-bold tracking-tight">Collections & Sample Packs</h2>
            <span className="text-adinkra-gold/60 text-lg font-light">{albums.length} packs</span>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {albums.map((item, index) => {
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
                  name="collection-accordion"
                  className="group bg-zinc-900/80 border border-white/10 hover:border-adinkra-highlight/40 rounded-3xl overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <summary className="px-8 py-8 cursor-pointer flex flex-col md:flex-row gap-6 hover:bg-white/5 transition-all list-none">
                    <div className="w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10">
                      <img 
                        src={cover} 
                        alt={getTitle(f)} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-2xl font-semibold group-hover:text-adinkra-highlight transition-colors tracking-tight pr-4">
                          {getTitle(f)}
                        </h3>
                        <span className="text-xs bg-adinkra-highlight text-black px-4 py-1.5 rounded-full font-medium tracking-wider self-start">PACK</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {meta.map((m, i) => (
                          <span key={i} className="text-xs uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                            {m}
                          </span>
                        ))}
                        {f.releaseDate && (
                          <span className="text-xs uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                            {new Date(f.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </summary>

                  <div className="px-8 pb-10 border-t border-white/10 bg-zinc-950/50">
                    <div className="pt-8 space-y-10">
                      {previewUrls.length > 0 && (
                        <div>
                          <h4 className="uppercase tracking-[3px] text-xs text-adinkra-gold/60 mb-4 font-mono">PREVIEWS</h4>
                          <div className="space-y-8">
                            {previewUrls.map((url, idx) => (
                              <LazyWaveformPlayer key={idx} audioUrl={url} />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-6 justify-between items-center pt-6 border-t border-white/10">
                        <div>
                          <div className="text-sm text-adinkra-gold/60">Price</div>
                          <div className="text-4xl font-bold tabular-nums">{priceStr}</div>
                          {isFree && <div className="text-green-400 mt-1 text-sm">✓ Free Download</div>}
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleLike(slug); }}
                            disabled={loadingLikes[slug]}
                            className="px-8 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-3 transition-all text-sm font-medium"
                          >
                            ♡ <span className="tabular-nums">{likes[slug] || 0}</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAddOrDownload(item); }}
                            className="px-10 py-3.5 bg-adinkra-highlight hover:bg-yellow-400 active:bg-yellow-500 text-black font-semibold rounded-2xl transition-all shadow-sm"
                          >
                            {isFree ? "Download Now" : "Add to Cart"}
                          </button>
                        </div>
                      </div>

                      {f.description && (
                        <div className="prose prose-invert max-w-none text-adinkra-gold/80">
                          <h4 className="font-semibold text-lg mb-4 text-white">Description</h4>
                          {renderPortableText(f.description)}
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      </main>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <AccordionFaq title="Adinkra Audio Licensing FAQ" faqs={licensingFaqs} />
      </div>

      {/* Toast */}
      {cartToast && (
        <div className="fixed bottom-24 right-6 bg-adinkra-highlight text-adinkra-bg px-6 py-4 rounded-2xl shadow-2xl font-semibold z-50">
          ✓ Added to Cart
        </div>
      )}

      {/* Floating Cart Button */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 bg-adinkra-highlight hover:bg-yellow-400 active:bg-yellow-500 text-adinkra-bg px-7 py-4 rounded-2xl shadow-2xl font-semibold flex items-center gap-3 transition-all z-50"
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