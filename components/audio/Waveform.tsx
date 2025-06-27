'use client';

import { useRef, useEffect, useState } from 'react';
import { useWavesurfer } from '@wavesurfer/react';
import type WaveSurfer from 'wavesurfer.js';

interface WaveformProps {
  audioUrl: string;
  onReady: (ws: WaveSurfer) => void;
}

const Waveform: React.FC<WaveformProps> = ({ audioUrl, onReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [resolvedColors, setResolvedColors] = useState({
    waveColor: '#a1a1aa',
    progressColor: '#f43f5e',
    cursorColor: '#18181b',
  });

  useEffect(() => {
    // This effect runs once on mount to resolve CSS variables.
    const style = getComputedStyle(document.documentElement);
    const mutedForeground = style.getPropertyValue('--muted-foreground').trim();
    const accent = style.getPropertyValue('--accent').trim();
    const foreground = style.getPropertyValue('--foreground').trim();

    setResolvedColors({
      waveColor: `hsl(${mutedForeground})`,
      progressColor: `hsl(${accent})`,
      cursorColor: `hsl(${foreground})`,
    });
  }, []);

  const { wavesurfer, isReady } = useWavesurfer({
    container: containerRef,
    url: audioUrl,
    waveColor: resolvedColors.waveColor,
    progressColor: resolvedColors.progressColor,
    height: 80,
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    cursorColor: resolvedColors.cursorColor,
    cursorWidth: 2,
    interact: false,
  });

  useEffect(() => {
    if (isReady && wavesurfer) {
      onReady(wavesurfer);
    }
  }, [isReady, wavesurfer, onReady]);

  return <div ref={containerRef} className="w-full" />;
};

export default Waveform;
