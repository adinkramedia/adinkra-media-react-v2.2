import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import AccordionFaq from "../components/AccordionFaq";
import { CartProvider, useCart } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";
import { sanity } from "../lib/sanity";
import groq from "groq";

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

const query = groq`
*[
  _type == "audioTrack" || _type == "album"
] | order(_createdAt desc) {
  _id,
  _type,
  title,
  slug,
  contributor->{
    name,
    slug,
    verified,
    bio,
    location,
    profileImage {
      asset-> { url }
    }
  },
  category,
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
  tracks[]->{ 
    _id, 
    title,
    duration,
    bpm 
  },
  totalFiles,
  releaseDate,
  packGenre,
  packMood,
  album->{ title },
  keyScale,
  energyLevel,
  loopable,
  usageType,
  instruments,
  tags
}
`;

const licensingFaqs = [
  {
    question: "Can I use these tracks commercially?",
    answer:
      "Yes. Unless stated otherwise, you may use Adinkra Library in films, podcasts, games, or educational content with credit.",
  },
  {
    question: "What license do I get when I purchase?",
    answer:
      "You receive a royalty-free license for life. You're allowed to use it in multiple projects without paying again.",
  },
  {
    question: "What am I NOT allowed to do?",
    answer:
      "You can't resell or redistribute the raw audio as-is (e.g., upload to stock platforms, remix and sell, etc.).",
  },
];

const allCategories = [
  { value: "All", title: "All" },
  { value: "music", title: "Music" },
  { value: "scores-cinematic", title: "Cinematic" },
  { value: "meditation", title: "Meditation" },
  { value: "world-traditional", title: "World" },
  { value: "sound-effects", title: "SFX" },
  { value: "sound-design", title: "Sound Design" },
  { value: "ambient", title: "Ambient" },
  { value: "drum-pack", title: "Drums" },
  { value: "ambient-pack", title: "Ambient Packs" },
  { value: "traditional-instruments", title: "Traditional" },
  { value: "cinematic-pack", title: "Cinematic Packs" },
  { value: "sound-fx-pack", title: "SFX Packs" },
  { value: "sound-design-pack", title: "Sound Design Packs" },
  { value: "synth-pack", title: "Synth" },
  { value: "drum-library", title: "Libraries" },
  { value: "atmosphere-pack", title: "Atmosphere Packs" },
  { value: "drone-pack", title: "Drone Packs" },
  { value: "field-recording-pack", title: "Field Recording Packs" },
];

function StandaloneAudioPlayer({ audioUrl }) {
  const audioRef = useRef(null);
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
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.log("Play failed:", e));
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
    <div className="w-full flex items-center gap-2 md:gap-3 bg-zinc-950/50 p-3 rounded-lg">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        disabled={!isLoaded}
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isPlaying
            ? "bg-adinkra-highlight text-adinkra-bg"
            : "bg-adinkra-gold/20 text-adinkra-gold hover:bg-adinkra-highlight hover:text-adinkra-bg"
        } ${!isLoaded ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label={isPlaying ? "Pause preview" : "Play preview"}
      >
        {isPlaying ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div
          className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer relative overflow-hidden"
          onClick={seek}
        >
          <div
            className="absolute top-0 left-0 h-full bg-adinkra-highlight rounded-full transition-all"
            style={{
              width: duration ? `${(currentTime / duration) * 100}%` : "0%",
            }}
          />
        </div>
        <span className="hidden sm:block text-xs text-adinkra-gold/60 font-mono whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

function TrackRow({
  item,
  index,
  isPlaying,
  onPlay,
  likes,
  onLike,
  loadingLike,
  onAddToCart,
  navigate,
}) {
  const f = item;
  const slug = f.slug?.current || item._id;
  const isLiked = likes[slug] > 0;
  const title = f.title || "Untitled";
  const artistName = f.contributor?.name || "adinkra media";
  const albumName = f.album?.title || "—";
  const cover = f.coverImage?.asset?.url || "/placeholder.jpg";
  const price = f.freeDownload ? "Free" : `$${Number(f.price || 0).toFixed(2)}`;
  const previewUrl = f.previewAudio?.asset?.url || null;

  const genres = Array.isArray(f.genre)
    ? f.genre.slice(0, 2)
    : [f.genre].filter(Boolean);
  const moods = Array.isArray(f.mood)
    ? f.mood.slice(0, 2)
    : [f.mood].filter(Boolean);

  return (
    <div className="group">
      <div
        className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 ${
          isPlaying ? "bg-white/10 border-white/10" : ""
        }`}
      >
        {/* Always-visible play button (mobile + desktop) */}
        <div className="w-10 flex justify-center flex-shrink-0">
          {previewUrl ? (
            <button
              type="button"
              onClick={onPlay}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isPlaying
                  ? "bg-adinkra-highlight text-adinkra-bg"
                  : "bg-adinkra-gold/15 text-adinkra-gold hover:bg-adinkra-highlight hover:text-adinkra-bg"
              }`}
              aria-label={isPlaying ? "Stop preview" : "Play preview"}
              title={isPlaying ? "Stop preview" : "Play preview"}
            >
              {isPlaying ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          ) : (
            <span className="text-sm text-adinkra-gold/40 font-mono">
              {index + 1}
            </span>
          )}
        </div>

        <div className="w-14 h-14 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900 ring-1 ring-white/10">
          <img src={cover} alt={title} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <div
            onClick={() => navigate(`/audio/${slug}`)}
            className={`font-medium text-[13px] md:text-base leading-tight ${
              isPlaying ? "text-adinkra-highlight" : "text-white"
            } break-words cursor-pointer hover:text-adinkra-highlight transition-colors`}
          >
            {title}
          </div>

          <div className="mt-1">
            <div
              onClick={() =>
                navigate(`/contributor/${f.contributor?.slug?.current}`)
              }
              className="text-xs text-adinkra-gold/50 cursor-pointer hover:text-adinkra-highlight transition-colors truncate"
            >
              {artistName}
            </div>
            {albumName !== "—" && (
              <div className="text-xs text-adinkra-gold/40 truncate">
                {albumName}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {f.category && (
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] md:text-xs text-adinkra-gold/80">
                {f.category}
              </span>
            )}
            {genres.map((genre) => (
              <span
                key={genre}
                className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] md:text-xs text-adinkra-gold/80"
              >
                {genre}
              </span>
            ))}
            {moods.map((mood) => (
              <span
                key={mood}
                className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] md:text-xs text-adinkra-gold/80"
              >
                {mood}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onLike(slug)}
          disabled={loadingLike}
          className={`p-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block ${
            isLiked
              ? "text-red-500 opacity-100"
              : "text-adinkra-gold/40 hover:text-white"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        <div className="hidden md:block text-sm font-medium text-adinkra-gold whitespace-nowrap">
          {price}
        </div>

        <button
          type="button"
          onClick={() => onAddToCart(item)}
          className={`p-3 md:p-2 rounded-lg transition-colors ${
            f.freeDownload
              ? "text-green-400 hover:bg-green-400/10"
              : "text-adinkra-highlight hover:bg-adinkra-highlight/10"
          }`}
          aria-label={f.freeDownload ? "Download free" : "Add to cart"}
        >
          {f.freeDownload ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="md:hidden mt-1 text-adinkra-highlight text-xs font-semibold px-3">
        {price}
      </div>

      {isPlaying && previewUrl && (
        <div className="px-3 pb-3 pt-1">
          <div className="pl-0 sm:pl-11">
            <StandaloneAudioPlayer audioUrl={previewUrl} />
          </div>
        </div>
      )}
    </div>
  );
}

function AlbumAccordion({
  item,
  likes,
  onLike,
  loadingLike,
  onAddToCart,
  navigate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const f = item;
  const slug = f.slug?.current || item._id;
  const cover = f.coverImage?.asset?.url || "/placeholder.jpg";
  const title = f.title || "Untitled";
  const price = f.freeDownload ? "Free" : `$${Number(f.price || 0).toFixed(2)}`;
  const isLiked = likes[slug] > 0;
  const trackCount =
    f.totalFiles || (Array.isArray(f.tracks) ? f.tracks.length : 0);
  const genre = Array.isArray(f.packGenre) ? f.packGenre[0] : f.packGenre;

  const formatArray = (arr) => {
    if (!arr) return [];
    if (Array.isArray(arr)) return arr;
    return [arr];
  };

  const packGenres = formatArray(f.packGenre);
  const previewUrls = formatArray(f.previewAudioArray);
  const downloadUrls = formatArray(f.downloadUrls);

  const handleNavigate = (e) => {
    if (e) e.stopPropagation();
    navigate(`/audio/${slug}`);
  };

  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
      <div
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900 ring-1 ring-white/10 relative cursor-pointer"
          onClick={handleNavigate}
        >
          <img src={cover} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center md:hidden">
            <svg
              className={`w-6 h-6 text-white transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            onClick={handleNavigate}
            className="font-semibold text-white text-lg md:text-xl break-words leading-tight cursor-pointer hover:text-adinkra-highlight transition-colors"
          >
            {title}
          </h3>
          <p className="text-sm text-adinkra-gold/50 mt-1">
            {genre || "Sample Pack"} • {trackCount}{" "}
            {trackCount === 1 ? "track" : "tracks"}
          </p>
          <div className="flex items-center gap-2 mt-2 md:hidden">
            <span className="text-adinkra-highlight font-bold">{price}</span>
            {f.freeDownload && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                FREE
              </span>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="text-xl font-bold text-adinkra-gold">{price}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLike(slug);
            }}
            disabled={loadingLike[slug]}
            className={`p-2 rounded-lg transition-colors ${
              isLiked
                ? "text-red-500"
                : "text-adinkra-gold/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(item);
            }}
            className="px-4 py-2 bg-adinkra-highlight text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            {f.freeDownload ? "Download" : "Add to Cart"}
          </button>
          <svg
            className={`w-5 h-5 text-adinkra-gold/60 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 p-4 md:p-6 space-y-6">
          {previewUrls.length > 0 && (
            <div className="bg-zinc-950/30 rounded-xl p-4">
              <h4 className="text-xs uppercase tracking-wider text-adinkra-gold/40 mb-3">
                Preview Audio ({previewUrls.length})
              </h4>
              <div className="space-y-3">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-adinkra-gold/60 w-6 font-mono">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <StandaloneAudioPlayer audioUrl={url} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(f.tracks) && f.tracks.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-adinkra-gold/40 mb-3">
                Tracks Included
              </h4>
              <div className="bg-zinc-950/30 rounded-xl p-4 space-y-2 text-sm">
                {f.tracks.map((track, idx) => (
                  <div
                    key={track._id}
                    className="flex justify-between py-1 border-b border-white/10 last:border-0 gap-2"
                  >
                    <span className="min-w-0 break-words">
                      {idx + 1}. {track.title}
                    </span>
                    {track.duration && (
                      <span className="text-adinkra-gold/60 font-mono flex-shrink-0">
                        {track.duration}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-adinkra-gold/40 mb-2">
                  Description
                </h4>
                <div className="text-sm text-adinkra-gold/80 leading-relaxed bg-zinc-950/30 p-4 rounded-lg">
                  {f.description ? (
                    renderPortableText(f.description)
                  ) : (
                    <p className="text-adinkra-gold/40 italic">
                      No description available
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-adinkra-gold/40 block text-xs uppercase tracking-wider mb-1">
                    Category
                  </span>
                  <span className="text-white">{f.category || "—"}</span>
                </div>
                <div>
                  <span className="text-adinkra-gold/40 block text-xs uppercase tracking-wider mb-1">
                    Total Files
                  </span>
                  <span className="text-white font-mono">
                    {f.totalFiles || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-adinkra-gold/40 block text-xs uppercase tracking-wider mb-1">
                    Release Date
                  </span>
                  <span className="text-white">
                    {f.releaseDate
                      ? new Date(f.releaseDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-adinkra-gold/40 block text-xs uppercase tracking-wider mb-1">
                    Price
                  </span>
                  <span className="text-adinkra-highlight font-bold">
                    {price}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {packGenres.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-adinkra-gold/40 mb-2">
                    Pack Genres
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {packGenres.map((g, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-adinkra-highlight/20 text-adinkra-highlight rounded-full text-sm"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {downloadUrls.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-adinkra-gold/40 mb-2">
                    Pack includes
                  </h4>
                  <p className="text-sm text-adinkra-gold/60">
                    {downloadUrls.length} downloadable file
                    {downloadUrls.length === 1 ? "" : "s"} after purchase
                  </p>
                </div>
              )}
              <div className="flex gap-3 md:hidden pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => onLike(slug)}
                  disabled={loadingLike[slug]}
                  className={`flex-1 py-3 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                    isLiked
                      ? "border-red-500 text-red-500"
                      : "border-white/10 text-adinkra-gold hover:bg-white/5"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill={isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {isLiked ? "Liked" : "Like"}
                </button>
                <button
                  type="button"
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

/** Mobile-safe pagination: wraps, compact on small screens */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [1];
  if (currentPage > 3) pages.push("...");

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) pages.push(i);
  }

  if (currentPage < totalPages - 2) pages.push("...");
  if (!pages.includes(totalPages)) pages.push(totalPages);

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-8 px-1">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 sm:px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
      >
        Prev
      </button>

      <div className="flex flex-wrap justify-center gap-1 max-w-full">
        {pages.map((page, idx) => (
          <button
            key={`${page}-${idx}`}
            type="button"
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`min-w-[2.25rem] h-9 px-2 flex items-center justify-center rounded-lg transition-colors text-sm ${
              page === currentPage
                ? "bg-adinkra-highlight text-adinkra-bg font-semibold"
                : page === "..."
                ? "text-adinkra-gold/50 cursor-default"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 sm:px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
      >
        Next
      </button>
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
  const { addToCart, cartItems, clearCart } = useCart();

  // Separate pagination so albums/tracks don't fight each other
  const [albumsPage, setAlbumsPage] = useState(1);
  const [singlesPage, setSinglesPage] = useState(1);
  const itemsPerPage = 12;

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

  // Reset pages when filters change
  useEffect(() => {
    setAlbumsPage(1);
    setSinglesPage(1);
  }, [selectedCategory, searchQuery]);

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

  const filteredItems = items.filter((item) => {
    const f = item;
    if (selectedCategory !== "All" && f.category !== selectedCategory)
      return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const genreMatch = Array.isArray(f.genre)
      ? f.genre.some((g) => g.toLowerCase().includes(q))
      : (f.genre || "").toLowerCase().includes(q);
    const moodMatch = Array.isArray(f.mood)
      ? f.mood.some((m) => m.toLowerCase().includes(q))
      : (f.mood || "").toLowerCase().includes(q);
    const packGenreMatch = Array.isArray(f.packGenre)
      ? f.packGenre.some((g) => g.toLowerCase().includes(q))
      : (f.packGenre || "").toLowerCase().includes(q);
    return (
      (f.title || "").toLowerCase().includes(q) ||
      genreMatch ||
      moodMatch ||
      packGenreMatch
    );
  });

  const singles = filteredItems.filter((item) => item._type === "audioTrack");
  const albums = filteredItems.filter((item) => item._type === "album");

  const totalPagesAlbums = Math.max(1, Math.ceil(albums.length / itemsPerPage));
  const totalPagesSingles = Math.max(
    1,
    Math.ceil(singles.length / itemsPerPage)
  );

  const safeAlbumsPage = Math.min(albumsPage, totalPagesAlbums);
  const safeSinglesPage = Math.min(singlesPage, totalPagesSingles);

  const paginatedAlbums = albums.slice(
    (safeAlbumsPage - 1) * itemsPerPage,
    safeAlbumsPage * itemsPerPage
  );
  const paginatedSingles = singles.slice(
    (safeSinglesPage - 1) * itemsPerPage,
    safeSinglesPage * itemsPerPage
  );

  const handlePlay = (id) => {
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null);
    } else {
      document.querySelectorAll("audio").forEach((a) => {
        a.pause();
        a.currentTime = 0;
      });
      setCurrentlyPlaying(id);
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
      if (Array.isArray(f.downloadUrls))
        downloadUrls = f.downloadUrls.filter(Boolean);
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

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen overflow-x-hidden">
      <Header />

      <section className="relative min-h-[30vh] flex items-end pb-6 overflow-hidden bg-gradient-to-b from-zinc-900 to-adinkra-bg">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-adinkra-highlight/20 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
            Adinkra <span className="text-adinkra-highlight">Library</span>
          </h1>
          <p className="text-base text-adinkra-gold/60 max-w-xl mb-4">
            Professional audio for games, film, video, podcasts, and digital
            experiences.
          </p>

          {/* Trust / payments */}
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs sm:text-sm text-adinkra-gold/70">
            <svg
              className="w-4 h-4 text-adinkra-highlight flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>
              Secure checkout with{" "}
              <span className="text-adinkra-gold font-medium">Paddle</span>
              {" · "}Cards, PayPal & more
            </span>
          </div>
        </div>
      </section>

      <div className="sticky top-0 z-40 bg-adinkra-bg/95 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 min-w-0">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-adinkra-gold/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
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
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-adinkra-gold/40 hover:text-white"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="relative w-full sm:w-48 flex-shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-adinkra-highlight/50 appearance-none cursor-pointer"
              >
                {allCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.title}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-adinkra-gold/40 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-8 pb-32 overflow-x-hidden">
        {/* COLLECTIONS FIRST */}
        {albums.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-4 gap-3">
              <h2 className="text-xl font-bold text-white">
                Collections & Sample Packs
              </h2>
              <span className="text-sm text-adinkra-gold/40 flex-shrink-0">
                {albums.length} packs
              </span>
            </div>
            <div className="space-y-4">
              {paginatedAlbums.map((item) => (
                <AlbumAccordion
                  key={item._id}
                  item={item}
                  likes={likes}
                  onLike={handleLike}
                  loadingLike={loadingLikes}
                  onAddToCart={handleAddOrDownload}
                  navigate={navigate}
                />
              ))}
            </div>
            {totalPagesAlbums > 1 && (
              <Pagination
                currentPage={safeAlbumsPage}
                totalPages={totalPagesAlbums}
                onPageChange={(page) => {
                  setAlbumsPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}
          </section>
        )}

        {/* SINGLE TRACKS SECOND */}
        {singles.length > 0 && (
          <section className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Single Tracks</h2>
                <p className="text-xs text-adinkra-gold/50 mt-1">
                  Tap the play button to preview a track
                </p>
              </div>
              <span className="text-sm text-adinkra-gold/40">
                {singles.length} tracks
              </span>
            </div>

            <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
              <div className="hidden md:grid grid-cols-[2.5rem_3rem_1fr_1fr_5rem_4rem_3rem] gap-3 px-4 py-3 text-xs text-adinkra-gold/40 uppercase tracking-wider border-b border-white/5">
                <span></span>
                <span></span>
                <span>Title</span>
                <span>Library</span>
                <span className="text-right">Price</span>
                <span></span>
              </div>
              <div className="divide-y divide-white/5">
                {paginatedSingles.map((item, index) => (
                  <TrackRow
                    key={item._id}
                    item={item}
                    index={
                      (safeSinglesPage - 1) * itemsPerPage + index
                    }
                    isPlaying={currentlyPlaying === item._id}
                    onPlay={() => handlePlay(item._id)}
                    likes={likes}
                    onLike={handleLike}
                    loadingLike={
                      loadingLikes[item.slug?.current || item._id]
                    }
                    onAddToCart={handleAddOrDownload}
                    navigate={navigate}
                  />
                ))}
              </div>
            </div>

            {totalPagesSingles > 1 && (
              <Pagination
                currentPage={safeSinglesPage}
                totalPages={totalPagesSingles}
                onPageChange={(page) => {
                  setSinglesPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}
          </section>
        )}

        {singles.length === 0 && albums.length === 0 && (
          <div className="text-center py-20 text-adinkra-gold/40">
            <p>No tracks found</p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-2 text-adinkra-highlight hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        <div className="mt-16 max-w-2xl">
          <AccordionFaq
            title="Adinkra Library Licensing FAQ"
            faqs={licensingFaqs}
          />
          <p className="mt-6 text-sm text-adinkra-gold/50 leading-relaxed">
            Payments are processed securely by{" "}
            <span className="text-adinkra-gold/80 font-medium">Paddle</span>.
            Adinkra Media does not store your card details. After checkout
            you’ll receive instant access to your downloads.
          </p>
        </div>
      </main>

      {cartToast && (
        <div className="fixed bottom-24 right-4 bg-adinkra-highlight text-adinkra-bg px-4 py-3 rounded-xl shadow-2xl font-semibold z-50 flex items-center gap-2">
          Added to Cart
        </div>
      )}

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 bg-adinkra-highlight hover:bg-yellow-400 text-adinkra-bg p-4 rounded-full shadow-2xl font-semibold flex items-center gap-2 transition-all z-50"
        aria-label="Open cart"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
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