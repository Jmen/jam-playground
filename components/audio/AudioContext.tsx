"use client";

import { createContext, useContext, useState, useRef, ReactNode } from "react";

interface AudioContextType {
  playingLoopId: string | null;
  setPlayingLoopId: (id: string | null) => void;
  audioContext: AudioContext | null;
  getAudioContext: () => AudioContext;
  stopAllLoops: () => void;
  registerStopFunction: (loopId: string, stopFn: () => void) => void;
  unregisterStopFunction: (loopId: string) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function useAudioContext() {
  const context = useContext(AudioContext);
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

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
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

  return (
    <AudioContext.Provider
      value={{
        playingLoopId,
        setPlayingLoopId,
        audioContext: audioContextRef.current,
        getAudioContext,
        stopAllLoops,
        registerStopFunction,
        unregisterStopFunction,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}
