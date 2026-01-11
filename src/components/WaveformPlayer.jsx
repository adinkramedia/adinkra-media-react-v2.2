import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

let currentActiveWave = null;

export default function WaveformPlayer({ audioUrl }) {
  const containerRef = useRef(null);
  const waveRef = useRef(null);

  useEffect(() => {
    if (!audioUrl || !containerRef.current) {
      console.warn("No audioUrl or containerRef");
      return;
    }

    if (waveRef.current) {
      waveRef.current.destroy();
      waveRef.current = null;
    }

    const wave = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(255, 215, 0, 0.4)",   // lighter gold with transparency
      progressColor: "#FFD700",               // full gold for progress
      height: 60,
      barWidth: 2,
      responsive: true,
      cursorWidth: 1,
      interact: true,
      // backgroundColor: "transparent",     // no background option in WaveSurfer, so do it with CSS below
    });

    waveRef.current = wave;

    wave.on("ready", () => {
      console.log("WaveSurfer ready!");
    });

    wave.on("error", (e) => {
      console.error("WaveSurfer error:", e);
    });

    wave.on("play", () => {
      if (currentActiveWave && currentActiveWave !== wave) {
        currentActiveWave.pause();
      }
      currentActiveWave = wave;
      console.log("Playing audio");
    });

    wave.load(audioUrl);

    return () => {
      if (waveRef.current) {
        waveRef.current.destroy();
        waveRef.current = null;
      }
      if (currentActiveWave === waveRef.current) {
        currentActiveWave = null;
      }
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (waveRef.current) {
      waveRef.current.playPause();
    } else {
      console.warn("WaveSurfer instance not ready");
    }
  };

  return (
    <div>
      <div
        ref={containerRef}
        className="waveform-container mb-2"
        style={{
          width: "100%",
          height: 60,
          backgroundColor: "transparent",  // Make sure background is transparent or your preferred color
          userSelect: "none",
        }}
      />
      <button
        onClick={togglePlay}
        className="bg-adinkra-highlight text-adinkra-bg font-semibold py-1 px-3 rounded text-sm hover:bg-yellow-500 transition"
      >
        ▶ Play / Pause
      </button>
    </div>
  );
}
