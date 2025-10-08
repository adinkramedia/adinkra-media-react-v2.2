// src/components/BackgroundAudioPlayer.jsx
import { useState, useMemo, useEffect } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
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
  } = useAudioPlayer();

  const { isAuthenticated } = useAuth0();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleToggleOpen = () => setIsOpen((prev) => !prev);

  // 🪷 Categories
  const categories = ["All", ...new Set(tracks.map((t) => t.fields.category))];
  const filteredTracks =
    selectedCategory === "All"
      ? tracks
      : tracks.filter((t) => t.fields.category === selectedCategory);

  const currentTrack = tracks[currentIndex]?.fields?.title || "Loading...";
  const currentFile = tracks[currentIndex]?.fields?.file?.fields?.file?.url;
  const isPremium = tracks[currentIndex]?.fields?.premium || false;

  // 🌈 Orb color based on category
  const orbColor = useMemo(() => {
    const cat = selectedCategory.toLowerCase();
    if (cat.includes("nature")) return "from-green-400 via-emerald-500 to-teal-600";
    if (cat.includes("meditation")) return "from-purple-500 via-indigo-500 to-violet-600";
    if (cat.includes("water") || cat.includes("ocean") || cat.includes("ambient"))
      return "from-blue-400 via-cyan-500 to-sky-600";
    if (cat.includes("fire") || cat.includes("energy") || cat.includes("rhythm"))
      return "from-orange-400 via-red-500 to-amber-600";
    return "from-yellow-500 via-amber-400 to-yellow-600";
  }, [selectedCategory]);

  // 🎵 Auto next track
  useEffect(() => {
    if (!audioRef?.current) return;
    const audio = audioRef.current;
    const handleEnded = () => nextTrack();
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [audioRef, nextTrack]);

  return (
    <>
      {/* 🌕 Floating Zen Orb */}
      <motion.button
        onClick={handleToggleOpen}
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 15px rgba(255,215,0,0.4)",
            "0 0 30px rgba(255,215,0,0.7)",
            "0 0 15px rgba(255,215,0,0.4)",
          ],
        }}
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: "easeInOut",
        }}
        className={`fixed bottom-6 left-6 z-50 w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-tr ${orbColor} shadow-lg border-2 border-adinkra-gold overflow-hidden`}
      >
        <motion.div
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.8,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-adinkra-highlight/20 blur-xl"
        />
        <Music className="relative w-7 h-7 text-adinkra-bg drop-shadow-md" />
      </motion.button>

      {/* 🎶 Expanded Player Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 left-6 right-6 sm:left-6 sm:right-auto z-50 bg-adinkra-highlight/20 backdrop-blur-lg border border-adinkra-highlight/30 rounded-2xl shadow-xl p-4 sm:w-[340px] flex flex-col gap-3 overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* 🪶 Header */}
            <div className="text-center mb-2">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-adinkra-gold text-lg font-semibold tracking-wide"
              >
                Zen Orb
              </motion.h2>
              <p className="text-xs text-adinkra-gold/70 italic">
                Meditative frequencies for mind, body, and culture.
              </p>
            </div>

            {/* 🏷️ Track Info */}
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-adinkra-gold truncate">
                {currentTrack}
              </p>
              <button onClick={handleToggleOpen}>
                <X className="w-5 h-5 text-adinkra-gold hover:text-adinkra-highlight" />
              </button>
            </div>

            {/* 🎚️ Category Selector */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-2 py-1 text-xs rounded transition ${
                    cat === selectedCategory
                      ? "bg-adinkra-highlight text-adinkra-bg font-semibold"
                      : "bg-adinkra-highlight/30 text-adinkra-gold hover:bg-adinkra-highlight/40"
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 🔒 Auth / Subscription Locks */}
            {!isAuthenticated ? (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 z-10">
                <p className="text-adinkra-gold mb-3 text-sm text-center">
                  Please log in to access background sounds.
                </p>
                <AuthButton />
              </div>
            ) : isPremium && !isSubscribed ? (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 z-10">
                <p className="text-adinkra-gold mb-2 text-sm text-center">
                  Subscribe monthly to unlock premium meditation sounds.
                </p>
                <p className="text-xs text-adinkra-gold/70">R45/month</p>
              </div>
            ) : null}

            {/* 🎛️ Controls (no waveform) */}
            <div className="flex items-center justify-between flex-wrap gap-2 mt-2">
              <SkipBack
                className="cursor-pointer w-6 h-6 text-adinkra-gold hover:text-adinkra-highlight"
                onClick={prevTrack}
              />
              {isPlaying ? (
                <Pause
                  className="cursor-pointer w-6 h-6 text-adinkra-gold hover:text-adinkra-highlight"
                  onClick={togglePlay}
                />
              ) : (
                <Play
                  className="cursor-pointer w-6 h-6 text-adinkra-gold hover:text-adinkra-highlight"
                  onClick={togglePlay}
                />
              )}
              <StopCircle
                className="cursor-pointer w-6 h-6 text-adinkra-gold hover:text-adinkra-highlight"
                onClick={stopTrack}
              />
              <SkipForward
                className="cursor-pointer w-6 h-6 text-adinkra-gold hover:text-adinkra-highlight"
                onClick={nextTrack}
              />
              <div className="flex items-center gap-1">
                <Volume2 className="w-5 h-5 text-adinkra-gold" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 accent-adinkra-highlight"
                />
              </div>
            </div>

            {/* 📜 Track List */}
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto mt-2 scrollbar-hide">
              {filteredTracks.map((track, idx) => (
                <button
                  key={idx}
                  className={`text-sm text-left truncate p-1 rounded hover:bg-adinkra-highlight/40 transition ${
                    idx === currentIndex ? "bg-adinkra-highlight/50 font-semibold" : ""
                  }`}
                  onClick={() => {
                    if (!isAuthenticated)
                      return alert("Please log in to play tracks.");
                    if (track.fields.premium && !isSubscribed)
                      return alert("Subscribe to access this track.");
                    setCurrentIndex(idx);
                  }}
                >
                  {track.fields.title}{" "}
                  {track.fields.premium ? "(Premium)" : ""}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
