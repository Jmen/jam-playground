"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  url: string;
  label: string;
}

export function AudioPlayer({ url, label }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);

  useEffect(() => {
    // Initialize AudioContext on first user interaction
    const initAudio = async () => {
      if (!audioContext) {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const gain = context.createGain();
        gain.connect(context.destination);
        
        setAudioContext(context);
        setGainNode(gain);
        
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await context.decodeAudioData(arrayBuffer);
          audioBufferRef.current = audioBuffer;
        } catch (error) {
          console.error("Error loading audio:", error);
        }
      }
    };

    initAudio();

    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      }
      
      if (audioContext) {
        // Don't close the AudioContext as it might be used by other players
        // Just clean up our connections
        if (gainNode) {
          gainNode.disconnect();
        }
      }
    };
  }, [url, audioContext, gainNode]);

  const togglePlayPause = () => {
    if (!audioContext || !gainNode || !audioBufferRef.current) return;

    if (isPlaying) {
      // Pause audio
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
      }
      
      // Calculate how much of the audio has been played
      offsetRef.current += (audioContext.currentTime - startTimeRef.current);
    } else {
      // Play audio
      const source = audioContext.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(gainNode);
      
      // Start playback from the current offset
      source.start(0, offsetRef.current);
      startTimeRef.current = audioContext.currentTime;
      
      // Store the source node for later stopping
      audioSourceRef.current = source;
      
      // Handle when audio finishes playing
      source.onended = () => {
        if (audioSourceRef.current === source) {
          setIsPlaying(false);
          offsetRef.current = 0;
          audioSourceRef.current = null;
        }
      };
    }
    
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!gainNode) return;
    
    if (isMuted) {
      gainNode.gain.value = 1;
    } else {
      gainNode.gain.value = 0;
    }
    
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex items-center space-x-2 p-2 border rounded-md">
      <div className="flex-1 truncate" title={label}>
        {label}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={togglePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
        data-testid={`play-button-${label}`}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </Button>
    </div>
  );
}
