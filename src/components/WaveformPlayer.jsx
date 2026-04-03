import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";

let currentActiveWave = null;

export default function WaveformPlayer({ audioUrl, compact = false, onPlayStateChange }) {
  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const lastUpdateRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // 🔥 Lazy initialize WaveSurfer (ONLY when needed)
  const initWaveSurfer = useCallback(() => {
    if (!audioUrl || !containerRef.current || waveRef.current) return;

    setIsReady(false);

    const wave = WaveSurfer.create({
      container: containerRef.current,
      height: compact ? 40 : 60,
      waveColor: "rgba(251, 229, 182, 0.3)",
      progressColor: "#f8b735",
      cursorColor: "#f8b735",
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      normalize: true,
      fillParent: true,
      interact: true,
      dragToSeek: true,
      backend: "MediaElement",
      minPxPerSec: 1,
    });

    waveRef.current = wave;

    // ✅ Ready
    wave.on("ready", () => {
      setIsReady(true);
      setDuration(wave.getDuration());
      wave.drawBuffer();
    });

    // ✅ Play
    wave.on("play", () => {
      if (currentActiveWave && currentActiveWave !== wave) {
        currentActiveWave.pause();
        currentActiveWave.seekTo(0);
      }
      currentActiveWave = wave;
      setIsPlaying(true);
      onPlayStateChange && onPlayStateChange(true);
    });

    // ✅ Pause
    wave.on("pause", () => {
      setIsPlaying(false);
      onPlayStateChange && onPlayStateChange(false);
    });

    // ✅ Finish
    wave.on("finish", () => {
      setIsPlaying(false);
      wave.seekTo(0);
      onPlayStateChange && onPlayStateChange(false);
    });

    // 🔥 Throttled audioprocess (BIG FIX)
    wave.on("audioprocess", () => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 300) {
        setCurrentTime(wave.getCurrentTime());
        lastUpdateRef.current = now;
      }
    });

    wave.on("error", (err) => {
      console.error("WaveSurfer error:", err);
    });

    // 🔥 Load the audio immediately when WaveSurfer is created
    // This fixes the "have to press play twice" issue
    wave.load(audioUrl);

    setIsInitialized(true);
  }, [audioUrl, compact, onPlayStateChange]);

  // 🔥 Auto-initialize when component mounts (key change)
  useEffect(() => {
    if (audioUrl) {
      initWaveSurfer();
    }
  }, [audioUrl, initWaveSurfer]);

  // 🔥 Resize (debounced)
  useEffect(() => {
    const handleResize = () => {
      if (!waveRef.current || !isReady) return;

      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        waveRef.current.drawBuffer();
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isReady]);

  // 🔥 Cleanup (unchanged logic, safer)
  useEffect(() => {
    return () => {
      if (waveRef.current) {
        waveRef.current.destroy();
        waveRef.current = null;
      }
    };
  }, []);

  // 🔥 Toggle play 
  const togglePlay = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isReady) return;

    waveRef.current?.playPause();
  }, [isReady]);

  // Format time
  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`w-full flex items-center gap-3 ${compact ? "py-2" : "py-3"}`}>
      
      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
          isReady
            ? isPlaying
              ? "bg-adinkra-highlight text-adinkra-bg"
              : "bg-adinkra-gold/20 text-adinkra-gold hover:bg-adinkra-highlight hover:text-adinkra-bg"
            : "bg-adinkra-gold/10 text-adinkra-gold/40"
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

      {/* Waveform */}
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className="w-full"
          style={{
            height: compact ? "40px" : "60px",
            minWidth: "100px",
            visibility: isInitialized ? "visible" : "hidden",
          }}
        />

        {/* Loading */}
        {isInitialized && !isReady && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-adinkra-bg/30 rounded"
            style={{ height: compact ? "40px" : "60px" }}
          >
            <div className="flex items-center gap-2 text-adinkra-gold/50 text-sm">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
            </div>
          </div>
        )}
      </div>

      {/* Time */}
      {isReady && (
        <div className="flex-shrink-0 text-xs text-adinkra-gold/60 font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      )}
    </div>
  );
}