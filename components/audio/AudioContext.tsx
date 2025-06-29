"use client";

import { createContext, useContext, useState, useRef, ReactNode } from "react";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface AudioContextType {
  playingLoopId: string | null;
  setPlayingLoopId: (id: string | null) => void;
  audioContext: AudioContext | null;
  getAudioContext: () => AudioContext;
  stopAllLoops: () => void;
  registerStopFunction: (loopId: string, stopFn: () => void) => void;
  unregisterStopFunction: (loopId: string) => void;
  getPeaks: (url: string) => number[][] | undefined;
  setPeaks: (url: string, peaks: number[][]) => void;
}

const JamAudioContext = createContext<AudioContextType | null>(null);

export function useAudioContext() {
  const context = useContext(JamAudioContext);
  if (!context) {
    throw new Error("useAudioContext must be used within an AudioProvider");
  }
  return context;
}

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [playingLoopId, setPlayingLoopId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const stopFunctionsRef = useRef<Map<string, () => void>>(new Map());
  const peaksCacheRef = useRef<Map<string, number[][]>>(new Map());

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const stopAllLoops = () => {
    // Stop the currently playing loop if any
    if (playingLoopId && stopFunctionsRef.current.has(playingLoopId)) {
      stopFunctionsRef.current.get(playingLoopId)?.();
    }
    setPlayingLoopId(null);
  };

  const registerStopFunction = (loopId: string, stopFn: () => void) => {
    stopFunctionsRef.current.set(loopId, stopFn);
  };

  const unregisterStopFunction = (loopId: string) => {
    stopFunctionsRef.current.delete(loopId);
  };

  const getPeaks = (url: string) => {
    return peaksCacheRef.current.get(url);
  };

  const setPeaks = (url: string, peaks: number[][]) => {
    peaksCacheRef.current.set(url, peaks);
  };

  return (
    <JamAudioContext.Provider
      value={{
        playingLoopId,
        setPlayingLoopId,
        audioContext: audioContextRef.current,
        getAudioContext,
        stopAllLoops,
        registerStopFunction,
        unregisterStopFunction,
        getPeaks,
        setPeaks,
      }}
    >
      {children}
    </JamAudioContext.Provider>
  );
}
