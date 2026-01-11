// src/components/BackgroundAudioPlayer.jsx
import { useState, useMemo, useEffect } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pause,
  Play,
  SkipForward,
  SkipBack,
  Volume2,
  X,
  StopCircle,
} from "lucide-react";
import AuthButton from "./AuthButton";

export default function BackgroundAudioPlayer({ isSubscribed }) {
  const {
    tracks,
    currentIndex,
    isPlaying,
    volume,
    setVolume,
    togglePlay,
    nextTrack,
    prevTrack,
    stopTrack,
    setCurrentIndex,
    audioRef,
    isPlayerOpen,
    setIsPlayerOpen,
  } = useAudioPlayer();

  const { isAuthenticated } = useAuth0();

  const [selectedCategory, setSelectedCategory] = useState("All");

  // Categories
  const categories = [
    "All",
    "Meditation",
    "Nature",
    "Sleep",
    "Experimental",
    "Ritual",
    "Oriental Fusion",
  ];

  // Filtered tracks for display
  const filteredTracks =
    selectedCategory === "All"
      ? tracks
      : tracks.filter((t) => t.fields.category === selectedCategory);

  // Current track details
  const currentTrackEntry = tracks[currentIndex];
  const currentTrackTitle = currentTrackEntry?.fields?.title || "Loading...";
  const currentCategory = currentTrackEntry?.fields?.category || "Unknown";
  const currentFileName = currentTrackEntry?.fields?.file?.fields?.file?.fileName || "Unknown file";
  const publishedDate = currentTrackEntry?.sys?.createdAt
    ? new Date(currentTrackEntry.sys.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";
  const isPremium = currentTrackEntry?.fields?.premium || false;

  // Dynamic color scheme
  const orbColor = useMemo(() => {
    const cat = selectedCategory.toLowerCase();
    if (cat.includes("nature")) return "from-green-400 via-emerald-500 to-teal-600";
    if (cat.includes("meditation")) return "from-purple-500 via-indigo-500 to-violet-600";
    if (cat.includes("sleep")) return "from-blue-900 via-indigo-900 to-purple-950";
    if (cat.includes("experimental")) return "from-fuchsia-500 via-pink-600 to-purple-700";
    if (cat.includes("ritual")) return "from-amber-600 via-red-600 to-orange-700";
    if (cat.includes("oriental") || cat.includes("fusion")) return "from-rose-400 via-amber-500 to-yellow-600";
    return "from-yellow-500 via-amber-400 to-yellow-600";
  }, [selectedCategory]);

  // Auto next track
  useEffect(() => {
    if (!audioRef?.current) return;
    const audio = audioRef.current;
    const handleEnded = () => nextTrack();
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [audioRef, nextTrack]);

  // Play selected track
  const playSelectedTrack = (filteredIdx) => {
    if (!isAuthenticated) return alert("Please log in to play tracks.");
    const selectedTrack = filteredTracks[filteredIdx];
    if (selectedTrack.fields.premium && !isSubscribed)
      return alert("Subscribe to access this premium track.");

    const globalIndex = tracks.findIndex((t) => t.sys.id === selectedTrack.sys.id);
    if (globalIndex !== -1) {
      setCurrentIndex(globalIndex);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isPlayerOpen && (
          <motion.div
            className={`fixed inset-x-4 bottom-20 sm:inset-x-auto sm:right-8 sm:bottom-24 sm:w-[440px] z-50 
                        bg-gradient-to-b from-[var(--bg-start)] to-[var(--bg-end)] backdrop-blur-xl 
                        border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden
                        transition-all duration-700`}
            style={{
              "--bg-start": orbColor.split(" via ")[0].replace("from-", ""),
              "--bg-end": orbColor.split(" to-")[1] || orbColor.split(" via ")[1],
              "--border-color": "rgba(212,175,55,0.4)",
            }}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPlayerOpen(false)}
              className="absolute top-5 right-5 p-3 rounded-full bg-black/40 hover:bg-black/60 
                         text-white hover:text-adinkra-highlight transition z-10 shadow-md"
              aria-label="Close Zen Orb"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header - Fixed Visible Title */}
            <div className="pt-8 px-6 pb-4 text-center border-b border-[var(--border-color)]">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wide"
              >
                Zen Orb
              </motion.h2>
              <p className="text-sm text-white/70 mt-1 italic">
                Meditative frequencies for mind, body, and culture
              </p>
            </div>

            {/* Track Info */}
            <div className="px-6 pt-5 pb-4">
              <h3 className="text-2xl font-bold text-white mb-4 truncate leading-tight">
                {currentTrackTitle}
              </h3>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm text-white/90">
                <div>
                  <span className="block text-white/60 font-medium mb-1">Category</span>
                  <span>{currentCategory}</span>
                </div>
                <div>
                  <span className="block text-white/60 font-medium mb-1">File</span>
                  <span className="truncate block">{currentFileName}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-white/60 font-medium mb-1">Published</span>
                  <span>{publishedDate}</span>
                </div>
              </div>

              {isPremium && (
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                  Premium Track
                </div>
              )}
            </div>

            {/* Category Selector */}
            <div className="px-6 pb-5">
              <label className="block text-sm text-white/70 font-medium mb-2">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-black/50 border border-[var(--border-color)] text-white 
                           px-5 py-3.5 rounded-xl appearance-none focus:outline-none focus:ring-2 
                           focus:ring-[var(--border-color)] transition cursor-pointer text-base font-medium"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%23FFFFFF' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1.2rem center",
                  backgroundSize: "14px",
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-black text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Auth / Subscription Overlays */}
            {!isAuthenticated ? (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-lg rounded-3xl flex flex-col items-center justify-center p-10 z-10">
                <p className="text-white text-lg font-medium text-center mb-6 leading-relaxed max-w-xs">
                  Please log in to access the full Zen Orb experience.
                </p>
                <AuthButton />
              </div>
            ) : isPremium && !isSubscribed ? (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-lg rounded-3xl flex flex-col items-center justify-center p-10 z-10">
                <p className="text-white text-lg font-medium text-center mb-4 leading-relaxed max-w-xs">
                  Unlock premium tracks with a monthly subscription.
                </p>
                <p className="text-xl font-bold text-white mb-6">R45 / month</p>
              </div>
            ) : null}

            {/* Controls */}
            <div className="px-6 pb-6 flex items-center justify-between flex-wrap gap-6">
              <SkipBack
                className="cursor-pointer w-10 h-10 text-white/80 hover:text-white transition transform hover:scale-110"
                onClick={prevTrack}
              />
              <button
                onClick={togglePlay}
                className={`p-5 rounded-full transition transform hover:scale-105 focus:outline-none
                            bg-gradient-to-r ${orbColor} bg-opacity-40 hover:bg-opacity-60`}
              >
                {isPlaying ? (
                  <Pause className="w-12 h-12 text-white" />
                ) : (
                  <Play className="w-12 h-12 text-white ml-1" />
                )}
              </button>
              <StopCircle
                className="cursor-pointer w-10 h-10 text-white/80 hover:text-white transition transform hover:scale-110"
                onClick={stopTrack}
              />
              <SkipForward
                className="cursor-pointer w-10 h-10 text-white/80 hover:text-white transition transform hover:scale-110"
                onClick={nextTrack}
              />
              <div className="flex-1 min-w-[140px] flex items-center gap-3">
                <Volume2 className="w-6 h-6 text-white/80" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                />
              </div>
            </div>

            {/* Track List */}
            <div className="px-6 pb-6 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
              {filteredTracks.map((track, filteredIdx) => {
                const isActive = track.sys.id === currentTrackEntry?.sys.id;
                return (
                  <button
                    key={track.sys.id}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 text-base ${
                      isActive
                        ? `bg-gradient-to-r ${orbColor} bg-opacity-50 text-white font-semibold shadow-inner border border-white/30`
                        : "text-white/90 hover:bg-white/10"
                    }`}
                    onClick={() => {
                      if (!isAuthenticated) return alert("Please log in to play tracks.");
                      if (track.fields.premium && !isSubscribed)
                        return alert("Subscribe to access this premium track.");

                      const globalIndex = tracks.findIndex((t) => t.sys.id === track.sys.id);
                      if (globalIndex !== -1) {
                        setCurrentIndex(globalIndex);
                      }
                    }}
                  >
                    {track.fields.title}
                    {track.fields.premium && (
                      <span className="ml-2 text-xs text-amber-300">(Premium)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}