"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import Waveform from './Waveform';
import { useAudioContext } from "./AudioContext";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/lib/time";
import type WaveSurfer from 'wavesurfer.js';

interface AudioItem {
  id: string;
  url?: string;
  file_name?: string;
}

interface LoopPlayerProps {
  audioItems: AudioItem[];
  loopIndex: number;
  loopId: string;
  createdAt: string;
}

export function LoopPlayer({ audioItems, loopIndex, loopId, createdAt }: LoopPlayerProps) {
  const { 
    playingLoopId, 
    setPlayingLoopId, 
    getAudioContext, 
    registerStopFunction,
    unregisterStopFunction
  } = useAudioContext();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [mutedTracks, setMutedTracks] = useState<Map<string, boolean>>(new Map());
  const [soloedTracks, setSoloedTracks] = useState<Map<string, boolean>>(new Map());
  const [trackDurations, setTrackDurations] = useState<Map<string, number>>(new Map());
  const [trackVolumes, setTrackVolumes] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const initialMuted = new Map<string, boolean>();
    const initialSoloed = new Map<string, boolean>();
    const initialVolumes = new Map<string, number>();
    audioItems.forEach(item => {
      initialMuted.set(item.id, false);
      initialSoloed.set(item.id, false);
      initialVolumes.set(item.id, 1);
    });
    setMutedTracks(initialMuted);
    setSoloedTracks(initialSoloed);
    setTrackVolumes(initialVolumes);
  }, [audioItems]);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainNodeRef = useRef<GainNode | null>(null);
  const trackGainNodesRef = useRef<Map<string, GainNode>>(new Map());
  const audioSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const loadingRef = useRef<boolean>(false);
  const wavesurferInstancesRef = useRef<Map<string, WaveSurfer>>(new Map());
  const animationFrameIdRef = useRef<number | null>(null);
  const playbackStartTimeRef = useRef(0);

  const stopAllAudio = useCallback(() => {
    console.log('stopAllAudio triggered');
    audioSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        console.warn('Error stopping audio source:', e);
      }
    });
    audioSourcesRef.current.clear();

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    wavesurferInstancesRef.current.forEach(ws => {
      ws.seekTo(0);
    });

    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const initAudio = () => {
      const context = getAudioContext();
      const masterGain = context.createGain();
      masterGain.connect(context.destination);

      audioContextRef.current = context;
      masterGainNodeRef.current = masterGain;

      audioItems.forEach(item => {
        if (item.url) {
          const trackGain = context.createGain();
          trackGain.connect(masterGain);
          trackGainNodesRef.current.set(item.id, trackGain);
        }
      });
    };
    
    initAudio();
    registerStopFunction(loopId, stopAllAudio);

    return () => {
      stopAllAudio();
      unregisterStopFunction(loopId);
      trackGainNodesRef.current.forEach(gain => gain.disconnect());
      if (masterGainNodeRef.current) {
        masterGainNodeRef.current.disconnect();
      }
    };
  }, [loopId, registerStopFunction, unregisterStopFunction, getAudioContext, audioItems, stopAllAudio]);

  const updateTrackGain = useCallback((trackId: string) => {
    const trackGainNode = trackGainNodesRef.current.get(trackId);
    if (!trackGainNode) return;

    const isMuted = mutedTracks.get(trackId) || false;
    const isSoloed = soloedTracks.get(trackId) || false;
    const anySoloed = Array.from(soloedTracks.values()).some(s => s);
    const trackVolume = trackVolumes.get(trackId) ?? 1;

    let targetGain = trackVolume;
    if (isMuted) {
      targetGain = 0;
    } else if (anySoloed && !isSoloed) {
      targetGain = 0;
    }

    trackGainNode.gain.setValueAtTime(
      targetGain,
      audioContextRef.current?.currentTime || 0,
    );
  }, [mutedTracks, soloedTracks, trackVolumes]);

  const playAllAudio = useCallback(() => {
    const context = audioContextRef.current;
    if (!context) return;

    playbackStartTimeRef.current = context.currentTime;
    stopAllAudio(); // Resets sources

    audioBuffersRef.current.forEach((buffer, id) => {
      const trackGainNode = trackGainNodesRef.current.get(id);
      if (!context || !trackGainNode) return;

      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(trackGainNode);
      audioSourcesRef.current.set(id, source);

      source.start(0);
    });

    setIsPlaying(true);

    const updateCursors = () => {
      if (!audioContextRef.current) return;
      const now = audioContextRef.current.currentTime;
      const elapsedTime = now - playbackStartTimeRef.current;

      wavesurferInstancesRef.current.forEach((ws) => {
        const duration = ws.getDuration();
        if (duration > 0) {
          const progress = (elapsedTime % duration) / duration;
          ws.seekTo(progress);
        }
      });

      animationFrameIdRef.current = requestAnimationFrame(updateCursors);
    };

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    animationFrameIdRef.current = requestAnimationFrame(updateCursors);
  }, [stopAllAudio]);

  const loadAudioFiles = useCallback(async () => {
    const context = audioContextRef.current;
    if (!context || loadingRef.current) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      audioBuffersRef.current.clear();
      const loadPromises = audioItems.map(async (item) => {
        if (!item.url) return;
        try {
          const response = await fetch(item.url, { cache: 'no-store' });
          if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
          const arrayBuffer = await response.arrayBuffer();
          const decodedBuffer = await context.decodeAudioData(arrayBuffer);
          audioBuffersRef.current.set(item.id, decodedBuffer);
        } catch (error) {
          console.error(`Error loading audio for track ${item.id}:`, error);
        }
      });
      await Promise.all(loadPromises);
    } catch (error) {
      console.error("Error in loadAudioFiles:", error);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [audioItems]);

  const startPlayback = useCallback(async () => {
    if (audioBuffersRef.current.size < audioItems.filter(i => i.url).length) {
      await loadAudioFiles();
    }
    playAllAudio();
  }, [loadAudioFiles, playAllAudio, audioItems]);

  const togglePlayPause = useCallback(async () => {
    const context = audioContextRef.current;
    if (!context) return;

    if (context.state === 'suspended') await context.resume();

    if (isPlaying) {
      stopAllAudio();
      setPlayingLoopId(null);
    } else {
      setPlayingLoopId(loopId);
      await startPlayback();
    }
  }, [isPlaying, loopId, setPlayingLoopId, startPlayback, stopAllAudio]);

  useEffect(() => {
    if (playingLoopId === loopId && !isPlaying) {
      startPlayback();
    } else if (playingLoopId !== loopId && isPlaying) {
      stopAllAudio();
    }
  }, [playingLoopId, loopId, isPlaying, startPlayback, stopAllAudio]);

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    if (masterGainNodeRef.current) {
      masterGainNodeRef.current.gain.setValueAtTime(
        newMuteState ? 0 : 1,
        audioContextRef.current?.currentTime || 0,
      );
    }
  };

  const handleVolumeChange = (trackId: string, value: number[]) => {
    const newVolume = value[0];
    setTrackVolumes(prev => new Map(prev).set(trackId, newVolume));
    updateTrackGain(trackId);
  };

  const handleWaveformReady = useCallback((trackId: string, ws: WaveSurfer) => {
    wavesurferInstancesRef.current.set(trackId, ws);
    const duration = ws.getDuration();
    setTrackDurations(prev => {
      if (prev.get(trackId) === duration) {
        return prev;
      }
      const newDurations = new Map(prev);
      newDurations.set(trackId, duration);
      return newDurations;
    });
  }, []);

  useEffect(() => {
    trackGainNodesRef.current.forEach((_, id) => updateTrackGain(id));
  }, [mutedTracks, soloedTracks, trackVolumes, updateTrackGain]);

  const toggleTrackMute = (trackId: string) => {
    setMutedTracks(prev => {
      const newMuted = new Map(prev);
      newMuted.set(trackId, !newMuted.get(trackId));
      return newMuted;
    });
  };

  const toggleTrackSolo = (trackId: string) => {
    setSoloedTracks(prev => {
      const newSoloed = new Map(prev);
      newSoloed.set(trackId, !newSoloed.get(trackId));
      return newSoloed;
    });
  };

  return (
    <div className={cn("p-4 border rounded-md", playingLoopId === loopId ? "border-primary" : "border-border")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-4">
            <h3 className="font-bold">Loop {loopIndex + 1}</h3>
            <div className="flex items-baseline space-x-2 text-xs text-muted-foreground">
              <p>{new Date(createdAt).toLocaleString()}</p>
              <p>({formatDistanceToNow(createdAt)})</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayPause}
            disabled={isLoading}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-24 border border-input"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : isPlaying ? (
              <Pause size={16} className="mr-2" />
            ) : (
              <Play size={16} className="mr-2" />
            )}
            <span>{isLoading ? "Loading" : isPlaying ? "Stop" : "Play"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            disabled={isLoading}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="w-8 h-8 border border-input"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>
        </div>
      </div>

      <div className="mt-2 overflow-x-auto pb-2">
        <div className="flex space-x-2">
          {audioItems.map((audio) => (
            <div key={audio.id} data-testid={`audio-${audio.id}`} className="flex-shrink-0 w-24 flex flex-col">
              <div className={cn("h-16 border-4 rounded-md flex items-center justify-center bg-card p-1 shadow-md overflow-hidden", mutedTracks.get(audio.id) ? "border-muted" : "border-border", soloedTracks.get(audio.id) && "border-primary")}>
                {audio.url ? (
                  <Waveform audioUrl={audio.url} onReady={(ws) => handleWaveformReady(audio.id, ws)} />
                ) : (
                  <div className="text-xs text-center text-gray-700 truncate w-full" title={audio.file_name || `Audio`}>
                    {audio.file_name || `Audio`}
                  </div>
                )}
              </div>

              <div className="text-center text-xs text-gray-500 mt-1 h-4">
                {trackDurations.has(audio.id) && `${trackDurations.get(audio.id)?.toFixed(2)}s`}
              </div>
              <div className="flex-grow flex flex-col items-center justify-center pt-2">
                <div className="flex items-center h-24">
                  <div className="flex flex-col justify-between h-full mr-2 text-xs text-gray-400">
                    <span>-</span>
                    <span>-</span>
                    <span>-</span>
                    <span>-</span>
                    <span>-</span>
                  </div>
                  <Slider defaultValue={[1]} max={1} step={0.01} onValueChange={(value) => handleVolumeChange(audio.id, value)} className="h-full w-2" orientation="vertical" />
                </div>
                <div className="flex justify-center mt-2 space-x-1">
                  <button onClick={() => toggleTrackMute(audio.id)} className={cn("w-8 h-6 text-xs font-bold border rounded focus:outline-none", mutedTracks.get(audio.id) ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground")} title="Mute">M</button>
                  <button onClick={() => toggleTrackSolo(audio.id)} className={cn("w-8 h-6 text-xs font-bold border rounded focus:outline-none", soloedTracks.get(audio.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")} title="Solo">S</button>
                </div>
              </div>
            </div>
          ))}
          {audioItems.length < 8 && Array.from({ length: 8 - audioItems.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-shrink-0 w-24 flex flex-col">
              <div className="h-16 border border-dashed rounded-md bg-secondary"></div>
              <div className="h-7"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
