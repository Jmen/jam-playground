"use client";

import { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWavesurfer } from "@wavesurfer/react";
import { useAudioContext } from "./AudioContext";
import type WaveSurfer from "wavesurfer.js";

interface WaveformProps {
  audioUrl: string;
  onReady: (ws: WaveSurfer) => void;
}

const Waveform: React.FC<WaveformProps> = ({ audioUrl, onReady }) => {
  const [isReadyToRender, setIsReadyToRender] = useState(false);

  useEffect(() => {
    // Defer rendering the heavy component to allow the UI to be responsive first.
    const timer = setTimeout(() => setIsReadyToRender(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isReadyToRender) {
    return (
      <div className="relative w-full h-[80px]">
        <div className="absolute inset-0 flex items-center justify-center bg-card rounded-md">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return <WaveformContent audioUrl={audioUrl} onReady={onReady} />;
};

const WaveformContent: React.FC<WaveformProps> = ({ audioUrl, onReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { getPeaks, setPeaks } = useAudioContext();
  const cachedPeaks = getPeaks(audioUrl);

  const { wavesurfer, isReady } = useWavesurfer({
    container: containerRef,
    url: audioUrl,
    peaks: cachedPeaks,
    height: 80,
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    interact: false,
  });

  useEffect(() => {
    if (isReady && wavesurfer) {
      const style = getComputedStyle(document.documentElement);
      const mutedForeground = style
        .getPropertyValue("--muted-foreground")
        .trim();
      const accent = style.getPropertyValue("--accent").trim();
      const foreground = style.getPropertyValue("--foreground").trim();

      wavesurfer.setOptions({
        waveColor: `hsl(${mutedForeground})`,
        progressColor: `hsl(${accent})`,
        cursorColor: `hsl(${foreground})`,
        cursorWidth: 2,
      });

      onReady(wavesurfer);

      if (!cachedPeaks) {
        const newPeaks = wavesurfer.exportPeaks();
        setPeaks(audioUrl, newPeaks);
      }
    }
  }, [isReady, wavesurfer, onReady, audioUrl, cachedPeaks, setPeaks]);

  return (
    <div className="relative w-full h-[80px]">
      <div
        ref={containerRef}
        className={cn("w-full", {
          "opacity-0": !isReady,
        })}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-card rounded-md">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default Waveform;
