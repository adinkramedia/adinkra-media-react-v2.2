import { useState, useRef, useEffect } from "react";
import WaveformPlayer from "./WaveformPlayer";

export default function LazyWaveformPlayer({ audioUrl, ...props }) {
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
      { 
        rootMargin: "150px",   // start loading a bit before it enters viewport
        threshold: 0.1 
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Super lightweight fake waveform - shows immediately, no audio loading
  if (!isVisible) {
    return (
      <div
        ref={containerRef}
        className="h-[60px] bg-black/30 rounded-xl flex items-center px-4 overflow-hidden relative"
      >
        <div className="flex items-end gap-[3px] w-full h-8">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="bg-adinkra-gold/40 w-[2.5px] rounded-full animate-pulse"
              style={{
                height: `${20 + Math.sin(i / 3) * 60 + Math.random() * 20}%`,
                animationDelay: `-${Math.random() * 1.2}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-xs opacity-40 font-mono pointer-events-none">
          waveform
        </div>
      </div>
    );
  }

  // Only now mount the real (heavy) WaveformPlayer
  return <WaveformPlayer audioUrl={audioUrl} {...props} />;
}