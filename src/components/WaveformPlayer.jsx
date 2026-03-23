import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

let currentActiveWave = null;

export default function WaveformPlayer({ audioUrl }) {

  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {

    if (!audioUrl || !containerRef.current) return;

    if (waveRef.current) {
      waveRef.current.destroy();
      waveRef.current = null;
    }

    const wave = WaveSurfer.create({

      container: containerRef.current,

      height: 70,

      waveColor: "rgba(248,183,53,0.35)",
      progressColor: "#f8b735",

      cursorColor: "#f8b735",
      cursorWidth: 2,

      barWidth: 2,
      barGap: 2,

      normalize: true,
      responsive: true,

      interact: true,
      dragToSeek: true,

      backend: "MediaElement"

    });

    waveRef.current = wave;

    wave.on("play", () => {

      if (currentActiveWave && currentActiveWave !== wave) {
        currentActiveWave.pause();
        currentActiveWave.seekTo(0);
      }

      currentActiveWave = wave;
      setIsPlaying(true);

    });

    wave.on("pause", () => {
      setIsPlaying(false);
    });

    wave.on("finish", () => {
      setIsPlaying(false);
      wave.seekTo(0);
    });

    wave.on("error", (err) => {
      console.error("WaveSurfer error:", err);
    });

    wave.load(audioUrl);

    return () => {

      if (waveRef.current) {
        waveRef.current.destroy();
        waveRef.current = null;
      }

    };

  }, [audioUrl]);

  const togglePlay = () => {

    if (!waveRef.current) return;

    waveRef.current.playPause();

  };

  return (

    <div className="w-full flex flex-col gap-2">

      <div
        ref={containerRef}
        className="w-full"
        style={{
          height: "70px",
          userSelect: "none"
        }}
      />

      <button
        onClick={togglePlay}
        className="self-start bg-adinkra-highlight text-adinkra-bg font-semibold py-1 px-3 rounded text-sm hover:bg-yellow-500 transition"
      >
        {isPlaying ? "❚❚ Pause" : "▶ Play"}
      </button>

    </div>

  );

}