import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import AccordionFaq from "../components/AccordionFaq";
import { CartProvider, useCart } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";
import { sanity } from "../lib/sanity";
import groq from "groq";

// Simple portable text renderer (unchanged)
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
  album->{ title },
  key,
  energyLevel,
  loopable,
  usageType,
  instruments,
  tags
}
`;

// Licensing FAQs (unchanged)
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

// Categories (unchanged)
const allCategories = [
  { value: "All", title: "All" },
  { value: "music", title: "Music" },
  { value: "scores-cinematic", title: "Cinematic" },
  { value: "meditation", title: "Meditation" },
  { value: "world-traditional", title: "World" },
  { value: "sound-effects", title: "SFX" },
  { value: "ambient", title: "Ambient" },
  { value: "drum-pack", title: "Drums" },
  { value: "ambient-pack", title: "Ambient Packs" },
  { value: "traditional-instruments", title: "Traditional" },
  { value: "cinematic-pack", title: "Cinematic Packs" },
  { value: "sound-fx-pack", title: "SFX Packs" },
  { value: "synth-pack", title: "Synth" },
  { value: "drum-library", title: "Libraries" },
];

// Simple Custom Audio Player (no waveform, fast, anti-download)
function SimpleAudioPlayer({ audioUrl, onPlayStateChange }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
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
    if (!audio || !audioUrl) return;

    const handleCanPlay = () => {
      setDuration(audio.duration || 0);
      setIsLoaded(true);
      audio.play().catch((e) => console.log("Autoplay prevented:", e));
    };

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl, onPlayStateChange]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;

    const rect = bar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = percent * duration;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlayEvt = () => { setIsPlaying(true); onPlayStateChange?.(true); };
    const onPauseEvt = () => { setIsPlaying(false); onPlayStateChange?.(false); };

    audio.addEventListener("play", onPlayEvt);
    audio.addEventListener("pause", onPauseEvt);

    return () => {
      audio.removeEventListener("play", onPlayEvt);
      audio.removeEventListener("pause", onPauseEvt);
    };
  }, [onPlayStateChange]);

  const preventDownload = (e) => e.preventDefault();

  return (
    <div className="w-full flex items-center gap-4" onContextMenu={preventDownload}>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        controlsList="nodownload"
        style={{ display: "none" }}
      />

      <button
        onClick={togglePlay}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isPlaying 
            ? "bg-adinkra-highlight text-adinkra-bg" 
            : "bg-adinkra-gold/20 text-adinkra-gold hover:bg-adinkra-highlight hover:text-adinkra-bg"
        }`}
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

      <div className="flex-1 flex items-center gap-3">
        <div 
          ref={progressRef}
          className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer relative"
          onClick={seek}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-adinkra-highlight rounded-full transition-all"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
          />
        </div>

        <div className="text-xs text-adinkra-gold/60 font-mono whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}

// Track Row Component - Mobile Friendly
function TrackRow({ item, index, isPlaying, onPlay, likes, onLike, loadingLike, onAddToCart }) {
  const f = item;
  const slug = f.slug?.current || item._id;
  const isLiked = likes[slug] > 0;
  
  const title = f.trackTitle || f.title || "Untitled";
  const artist = f.album?.title || "Adinkra Audio";
  const cover = f.coverImage?.asset?.url || "/placeholder.jpg";
  const price = f.freeDownload ? "Free" : `$${Number(f.price || 0).toFixed(2)}`;
  
  const tags = [
    ...(Array.isArray(f.genre) ? f.genre : [f.genre]).filter(Boolean),
    ...(Array.isArray(f.mood) ? f.mood : [f.mood]).filter(Boolean)
  ].slice(0, 2);

  return (
    <div 
      className={`group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 ${
        isPlaying ? 'bg-white/10 border-white/10' : ''
      }`}
    >
      <div className="w-8 flex justify-center flex-shrink-0">
        <span className="text-sm text-adinkra-gold/40 group-hover:hidden font-mono">{index + 1}</span>
        <button 
          onClick={onPlay}
          className="hidden group-hover:block text-adinkra-gold hover:text-adinkra-highlight transition-colors"
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
      </div>

      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900 ring-1 ring-white/10">
        <img src={cover} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* Mobile: Stack title and artist vertically, allow text to wrap */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-sm md:text-base leading-tight ${isPlaying ? 'text-adinkra-highlight' : 'text-white'} break-words`}>
          {title}
        </div>
        <div className="text-xs text-adinkra-gold/50 mt-1 flex flex-wrap items-center gap-1">
          <span className="truncate">{artist}</span>
          {tags.length > 0 && (
            <>
              <span className="mx-1">•</span>
              <span className="truncate">{tags.join(", ")}</span>
            </>
          )}
        </div>
      </div>

      <div className="hidden md:block text-xs text-adinkra-gold/40 w-16 text-right font-mono">
        {f.bpm ? `${f.bpm} BPM` : ""}
      </div>

      <div className="hidden md:block text-xs text-adinkra-gold/40 w-16 text-right font-mono">
        {f.duration || ""}
      </div>

      <button
        onClick={() => onLike(slug)}
        disabled={loadingLike}
        className={`p-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block ${
          isLiked ? 'text-red-500 opacity-100' : 'text-adinkra-gold/40 hover:text-white'
        }`}
      >
        <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <div className="text-sm font-medium text-adinkra-gold whitespace-nowrap">
        {price}
      </div>

      <button
        onClick={() => onAddToCart(item)}
        className={`p-2 rounded-lg transition-colors ${
          f.freeDownload 
            ? 'text-green-400 hover:bg-green-400/10' 
            : 'text-adinkra-highlight hover:bg-adinkra-highlight/10'
        }`}
      >
        {f.freeDownload ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )}
      </button>
    </div>
  );
}

// Album/Pack Detail Accordion Component
function AlbumAccordion({ item, isPlaying, onPlay, likes, onLike, loadingLike, onAddToCart }) {
  const [isOpen, setIsOpen] = useState(false);
  const f = item;
  const slug = f.slug?.current || item._id;
  const cover = f.coverImage?.asset?.url || "/placeholder.jpg";
  const title = f.title || "Untitled";
  const price = f.freeDownload ? "Free" : `$${Number(f.price || 0).toFixed(2)}`;
  const isLiked = likes[slug] > 0;
  
  const trackCount = f.totalFiles || (Array.isArray(f.tracks) ? f.tracks.length : 0);
  const genre = Array.isArray(f.packGenre) ? f.packGenre[0] : f.packGenre;
  
  // Format arrays
  const formatArray = (arr) => {
    if (!arr) return [];
    if (Array.isArray(arr)) return arr;
    return [arr];
  };
  
  const packGenres = formatArray(f.packGenre);
  const previewUrls = formatArray(f.previewAudioArray);
  const downloadUrls = formatArray(f.downloadUrls);

  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
      {/* Header - Always visible */}
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900 ring-1 ring-white/10 relative">
          <img src={cover} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center md:hidden">
            <svg 
              className={`w-6 h-6 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-lg md:text-xl break-words leading-tight">
            {title}
          </h3>
          <p className="text-sm text-adinkra-gold/50 mt-1">
            {genre || "Sample Pack"} • {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
          </p>
          <div className="flex items-center gap-2 mt-2 md:hidden">
            <span className="text-adinkra-highlight font-bold">{price}</span>
            {f.freeDownload && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">FREE</span>}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="text-xl font-bold text-adinkra-gold">{price}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onLike(slug); }}
            disabled={loadingLike[slug]}
            className={`p-2 rounded-lg transition-colors ${
              isLiked ? 'text-red-500' : 'text-adinkra-gold/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
            className="px-4 py-2 bg-adinkra-highlight text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            {f.freeDownload ? "Download" : "Add to Cart"}
          </button>
          <svg 
            className={`w-5 h-5 text-adinkra-gold/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="border-t border-white/10 p-4 md:p-6 space-y-6 animate-in slide-in-from-top-2">
          {/* Preview Player */}
          {previewUrls.length > 0 && (
            <div className="bg-zinc-950/50 rounded-xl p-4">
              <h4 className="text-xs uppercase tracking-wider text-adinkra-gold/40 mb-3">Preview Audio</h4>
              <div className="space-y-3">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-adinkra-gold/60 w-6">{idx + 1}</span>
                    <div className="flex-1">
                      <SimpleAudioPlayer 
                        audioUrl={url} 
                        onPlayStateChange={(playing) => {
                          if (playing) onPlay();
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Details */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-adinkra-gold/40 mb-2">Description</h4>
                <div className="text-sm text-adinkra-gold/80 leading-relaxed bg-zinc-950/30 p-4 rounded-lg">
                  {f.description ? renderPortableText(f.description) : <p className="text-adinkra-gold/40 italic">No description available</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-adinkra-gold/40 block text-xs uppercase tracking-wider mb-1">Category</span>
                  <span className="text-white">{f.category || "—"}</span>
                </div>
                <div>
                  <span className="text-adinkra-gold/40 block text-xs uppercase tracking-wider mb-1">Total Files</span>
                  <span className="text-white font-mono">{f.totalFiles || "—"}</span>
                </div>
                <div>
                  <span className="text-adinkra-gold/40 block text-xs uppercase tracking-wider mb-1">Release Date</span>
                  <span className="text-white">
                    {f.releaseDate ? new Date(f.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-adinkra-gold/40 block text-xs uppercase tracking-wider mb-1">Price</span>
                  <span className="text-adinkra-highlight font-bold">{price}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Genres & Actions */}
            <div className="space-y-4">
              {packGenres.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-adinkra-gold/40 mb-2">Pack Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {packGenres.map((g, i) => (
                      <span key={i} className="px-3 py-1 bg-adinkra-highlight/20 text-adinkra-highlight rounded-full text-sm">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {downloadUrls.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-adinkra-gold/40 mb-2">Download Files</h4>
                  <div className="space-y-2">
                    {downloadUrls.map((url, idx) => (
                      <a 
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-adinkra-gold/60 hover:text-adinkra-highlight transition-colors break-all"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="truncate">{url.split('/').pop() || `File ${idx + 1}`}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Actions */}
              <div className="flex gap-3 md:hidden pt-4 border-t border-white/10">
                <button
                  onClick={() => onLike(slug)}
                  disabled={loadingLike[slug]}
                  className={`flex-1 py-3 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                    isLiked 
                      ? 'border-red-500 text-red-500' 
                      : 'border-white/10 text-adinkra-gold hover:bg-white/5'
                  }`}
                >
                  <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {isLiked ? 'Liked' : 'Like'}
                </button>
                <button
                  onClick={() => onAddToCart(item)}
                  className="flex-[2] py-3 bg-adinkra-highlight text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  {f.freeDownload ? "Download Now" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AudioContent() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [likes, setLikes] = useState({});
  const [loadingLikes, setLoadingLikes] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartToast, setCartToast] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [activePreview, setActivePreview] = useState(null);

  const { addToCart, cartItems, clearCart } = useCart();

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

  const handlePlay = (id, audioUrl) => {
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null);
      setActivePreview(null);
    } else {
      setCurrentlyPlaying(id);
      setActivePreview(audioUrl);
    }
  };

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

  const getPreviewUrl = (item) => {
    if (item._type === "audioTrack") {
      return item.previewAudio?.asset?.url || null;
    }
    if (Array.isArray(item.previewAudioArray) && item.previewAudioArray.length > 0) {
      return item.previewAudioArray[0];
    }
    return null;
  };

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      <section className="relative h-[30vh] min-h-[200px] flex items-end pb-6 overflow-hidden bg-gradient-to-b from-zinc-900 to-adinkra-bg">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-adinkra-highlight/20 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
            Adinkra <span className="text-adinkra-highlight">Audio</span>
          </h1>
          <p className="text-base text-adinkra-gold/60 max-w-xl">
            Premium royalty-free music & cinematic soundscapes
          </p>
        </div>
      </section>

      <div className="sticky top-0 z-40 bg-adinkra-bg/95 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-adinkra-gold/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search tracks, genres, moods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-adinkra-gold/40 focus:outline-none focus:border-adinkra-highlight/50 focus:bg-zinc-900 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-adinkra-gold/40 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-48 bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-adinkra-highlight/50 appearance-none cursor-pointer"
              >
                {allCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.title}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-adinkra-gold/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32">
        {activePreview && (
          <div className="fixed bottom-20 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-lg border-t border-white/10 px-4 py-3">
            <div className="max-w-7xl mx-auto">
              <SimpleAudioPlayer 
                audioUrl={activePreview} 
                onPlayStateChange={(playing) => {
                  if (!playing) setCurrentlyPlaying(null);
                }}
              />
            </div>
          </div>
        )}

        {/* SINGLE TRACKS */}
        {singles.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Single Tracks</h2>
              <span className="text-sm text-adinkra-gold/40">{singles.length} tracks</span>
            </div>
            <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
              <div className="hidden md:grid grid-cols-[2.5rem_3rem_1fr_4rem_4rem_2.5rem_4rem_3rem] gap-3 px-4 py-3 text-xs text-adinkra-gold/40 uppercase tracking-wider border-b border-white/5">
                <span>#</span>
                <span></span>
                <span>Title</span>
                <span className="text-right">BPM</span>
                <span className="text-right">Time</span>
                <span></span>
                <span className="text-right">Price</span>
                <span></span>
              </div>
              <div className="divide-y divide-white/5">
                {singles.map((item, index) => (
                  <TrackRow
                    key={item._id}
                    item={item}
                    index={index}
                    isPlaying={currentlyPlaying === item._id}
                    onPlay={() => handlePlay(item._id, getPreviewUrl(item))}
                    likes={likes}
                    onLike={handleLike}
                    loadingLike={loadingLikes[item.slug?.current || item._id]}
                    onAddToCart={handleAddOrDownload}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* COLLECTIONS - Accordion Style */}
        {albums.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Collections & Sample Packs</h2>
              <span className="text-sm text-adinkra-gold/40">{albums.length} packs</span>
            </div>
            <div className="space-y-4">
              {albums.map((item) => (
                <AlbumAccordion
                  key={item._id}
                  item={item}
                  isPlaying={currentlyPlaying === item._id}
                  onPlay={() => handlePlay(item._id, getPreviewUrl(item))}
                  likes={likes}
                  onLike={handleLike}
                  loadingLike={loadingLikes}
                  onAddToCart={handleAddOrDownload}
                />
              ))}
            </div>
          </section>
        )}

        {singles.length === 0 && albums.length === 0 && (
          <div className="text-center py-20 text-adinkra-gold/40">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p>No tracks found</p>
            {searchQuery && (
              <button 
                onClick={() => {setSearchQuery(""); setSelectedCategory("All");}}
                className="mt-2 text-adinkra-highlight hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        <div className="mt-16 max-w-2xl">
          <AccordionFaq title="Adinkra Audio Licensing FAQ" faqs={licensingFaqs} />
        </div>
      </main>

      {cartToast && (
        <div className="fixed bottom-24 right-4 bg-adinkra-highlight text-adinkra-bg px-4 py-3 rounded-xl shadow-2xl font-semibold z-50 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Added to Cart
        </div>
      )}

      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 bg-adinkra-highlight hover:bg-yellow-400 text-adinkra-bg p-4 rounded-full shadow-2xl font-semibold flex items-center gap-2 transition-all z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
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

export default function Audio() {
  return (
    <CartProvider>
      <AudioContent />
    </CartProvider>
  );
}