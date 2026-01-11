import { createContext, useContext, useState, useRef, useEffect } from "react";
import { createClient } from "contentful";

const AudioPlayerContext = createContext();
export const useAudioPlayer = () => useContext(AudioPlayerContext);

const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

export function AudioPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [tracks, setTracks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false); // ← NEW: global open/close state

  // Fetch tracks from Contentful
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await client.getEntries({
          content_type: "backgroundAudioPlayer",
          order: "fields.title",
        });
        setTracks(res.items);
      } catch (err) {
        console.error("Error fetching background audio:", err);
      }
    };
    fetchTracks();
  }, []);

  // Load track when index changes
  useEffect(() => {
    if (audioRef.current && tracks.length > 0) {
      audioRef.current.src =
        tracks[currentIndex]?.fields?.file?.fields?.file?.url;
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
  }, [currentIndex, tracks, isPlaying]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    if (tracks.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const stopTrack = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const value = {
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
    isPlayerOpen,
    setIsPlayerOpen, // ← NEW: expose toggle
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="auto" />
    </AudioPlayerContext.Provider>
  );
}