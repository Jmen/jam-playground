'use client';

import { useRef, useEffect } from 'react';
import { useWavesurfer } from '@wavesurfer/react';
import type WaveSurfer from 'wavesurfer.js';

interface WaveformProps {
  audioUrl: string;
  onReady: (ws: WaveSurfer) => void;
}

const Waveform: React.FC<WaveformProps> = ({ audioUrl, onReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { wavesurfer, isReady } = useWavesurfer({
    container: containerRef,
    url: audioUrl,
    waveColor: '#a1a1aa', // zinc-400
    progressColor: '#f43f5e', // rose-500
    height: 80,
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    cursorColor: '#18181b',
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
