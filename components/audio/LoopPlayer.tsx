"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAudioContext } from "./AudioContext";
import { cn } from "@/lib/utils";

interface AudioItem {
  id: string;
  url?: string;
  file_name?: string;
}

interface LoopPlayerProps {
  audioItems: AudioItem[];
  loopIndex: number;
  loopId: string;
}

export function LoopPlayer({ audioItems, loopIndex, loopId }: LoopPlayerProps) {
  const { 
    playingLoopId, 
    setPlayingLoopId, 
    getAudioContext, 
    registerStopFunction,
    unregisterStopFunction
  } = useAudioContext();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Master mute for the whole loop
  const [mutedTracks, setMutedTracks] = useState<Map<string, boolean>>(
    new Map(),
  );
  const [soloedTracks, setSoloedTracks] = useState<Map<string, boolean>>(
    new Map(),
  );
  const [trackVolumes, setTrackVolumes] = useState<Map<string, number>>(
    new Map(audioItems.map(item => [item.id, 1])),
  );
  const [isLoading, setIsLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainNodeRef = useRef<GainNode | null>(null);
  const trackGainNodesRef = useRef<Map<string, GainNode>>(new Map());
  const audioSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const loadingRef = useRef<boolean>(false);

  useEffect(() => {
    // Initialize AudioContext and GainNode
    const initAudio = () => {
      const context = getAudioContext();
      const masterGain = context.createGain();
      masterGain.connect(context.destination);

      audioContextRef.current = context;
      masterGainNodeRef.current = masterGain;

      // Create gain nodes for each track
      audioItems.forEach(item => {
        if (item.url) {
          const trackGain = context.createGain();
          trackGain.connect(masterGain);
          trackGainNodesRef.current.set(item.id, trackGain);
        }
      });
    };
    
    initAudio();
    
    // Register stop function with the context
    registerStopFunction(loopId, stopAllAudio);

    return () => {
      stopAllAudio();
      unregisterStopFunction(loopId);
      
      // Clean up gain node connection
      // Clean up gain node connections
      trackGainNodesRef.current.forEach(gain => gain.disconnect());
      if (masterGainNodeRef.current) {
        masterGainNodeRef.current.disconnect();
      }
    };
  }, [loopId, registerStopFunction, unregisterStopFunction, getAudioContext]);

  // Load all audio files
  const loadAudioFiles = async () => {
    const context = audioContextRef.current;

    if (!context || loadingRef.current) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      // Clear existing buffers to ensure fresh loading
      audioBuffersRef.current.clear();
      
      const loadPromises = audioItems.map(async (item) => {
        // Skip if URL is not defined
        if (!item.url) return;
        
        try {
          console.log(`Loading audio ${item.id} from ${item.url}`);
          
          // Use a direct fetch with cache control
          const response = await fetch(item.url, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          
          if (arrayBuffer.byteLength === 0) {
            throw new Error('Received empty audio file');
          }
          
          console.log(`Decoding audio ${item.id}, size: ${arrayBuffer.byteLength} bytes`);
          
          // Use a promise to ensure proper decoding
          const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
            context.decodeAudioData(
              arrayBuffer,
              buffer => resolve(buffer),
              error => reject(new Error(`Decoding failed: ${error}`))
            );
          });
          
          console.log(`Audio ${item.id} decoded successfully, duration: ${audioBuffer.duration}s, channels: ${audioBuffer.numberOfChannels}`);
          
          if (audioBuffer.duration < 0.1) {
            throw new Error('Audio file too short or corrupted');
          }
          
          audioBuffersRef.current.set(item.id, audioBuffer);
        } catch (error) {
          console.error(`Error loading audio ${item.id}:`, error);
        }
      });
      
      await Promise.all(loadPromises);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  };

  // Helper function to play a single audio buffer
  const playAudioBuffer = (id: string, buffer: AudioBuffer) => {
    const context = audioContextRef.current;
    const trackGainNode = trackGainNodesRef.current.get(id);

    if (!context || !trackGainNode) {
      console.error(`No gain node for track ${id}`);
      return;
    }

    // Stop any existing source for this ID
    if (audioSourcesRef.current.has(id)) {
      try {
        audioSourcesRef.current.get(id)?.stop();
      } catch (e) {
        // ignore if already stopped
      }
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(trackGainNode); // Connect to the track's specific gain node
    source.loop = true; // Enable native looping

    source.onended = () => {
      audioSourcesRef.current.delete(id);
    };

    try {
      source.start(0);
      audioSourcesRef.current.set(id, source);
    } catch (err) {
      console.error(`Error starting audio source for ${id}:`, err);
    }
  };
  
  const playAllAudio = () => {
    const context = audioContextRef.current;
    const mainGainNode = masterGainNodeRef.current;

    if (!context || !mainGainNode) return;

    // Ensure all track gains are updated before playing
    trackGainNodesRef.current.forEach((_, trackId) => {
      updateTrackGain(trackId);
    });

    // Stop any existing sources before starting new ones
    stopAllAudio();

    console.log('playAllAudio triggered');

    audioBuffersRef.current.forEach((buffer, id) => {
      playAudioBuffer(id, buffer);
    });

    setIsPlaying(true);
  };

  const stopAllAudio = () => {
    audioSourcesRef.current.forEach((source) => {
      try {
        // Handle both AudioBufferSourceNode and our custom audio element wrapper
        if (typeof source.stop === 'function') {
          source.stop();
        }
        if (typeof source.disconnect === 'function') {
          source.disconnect();
        }
      } catch (e) {
        // Ignore errors from already stopped sources
        console.warn('Error stopping audio source:', e);
      }
    });
    audioSourcesRef.current.clear();
    
    // Update playing state
    setIsPlaying(false);
  };

  const togglePlayPause = async () => {
    const context = audioContextRef.current;
    if (!context) return;
    
    // If audio context is suspended (browser policy), resume it
    if (context.state === 'suspended') {
      await context.resume();
    }
    
    if (isPlaying) {
      stopAllAudio();
      setPlayingLoopId(null);
    } else {
      // If another loop is playing, stop it first
      if (playingLoopId && playingLoopId !== loopId) {
        // The context will handle stopping the other loop
        setPlayingLoopId(loopId);
      } else {
        setPlayingLoopId(loopId);
      }
      
      // Load audio files if not already loaded
      if (audioBuffersRef.current.size < audioItems.length) {
        await loadAudioFiles();
      }
      
      // Start looping playback
      playAllAudio();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const masterGain = masterGainNodeRef.current;
    if (!masterGain) return;

    const newMutedState = !isMuted;
    masterGain.gain.setValueAtTime(
      newMutedState ? 0 : 1,
      audioContextRef.current?.currentTime || 0,
    );
    setIsMuted(newMutedState);
  };

  const updateTrackGain = (trackId: string) => {
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
  };

  const handleVolumeChange = (trackId: string, value: number[]) => {
    const newVolume = value[0];
    setTrackVolumes(prev => new Map(prev).set(trackId, newVolume));
    updateTrackGain(trackId);
  };

  useEffect(() => {
    trackGainNodesRef.current.forEach((_, trackId) => {
      updateTrackGain(trackId);
    });
  }, [mutedTracks, soloedTracks]);

  const toggleTrackMute = (trackId: string) => {
    setMutedTracks(prev => {
      const newMap = new Map(prev);
      newMap.set(trackId, !newMap.get(trackId));
      return newMap;
    });
  };

  const toggleTrackSolo = (trackId: string) => {
    setSoloedTracks(prev => {
      const newMap = new Map(prev);
      newMap.set(trackId, !newMap.get(trackId));
      return newMap;
    });
  };
  

  
  // Update isPlaying state when playingLoopId changes
  useEffect(() => {
    if (playingLoopId === loopId) {
      // This loop should be playing
      if (!isPlaying) {
        // But it's not currently playing, so start it
        const startPlayback = async () => {
          if (audioBuffersRef.current.size < audioItems.length) {
            await loadAudioFiles();
          }
          playAllAudio();
          setIsPlaying(true);
        };
        startPlayback();
      }
    } else if (isPlaying) {
      // This loop is playing but shouldn't be
      stopAllAudio();
    }
  }, [playingLoopId, loopId, isPlaying, audioItems.length]);

  return (
    <div className={cn(
      "w-full p-3 border-2 border-transparent rounded-md",
      isPlaying && "border-red-500",
    )}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-base">Loop {loopIndex + 1}</h4>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlayPause}
            disabled={isLoading}
            aria-label={isPlaying ? "Pause" : "Play"}
            data-testid={`loop-play-button-${loopIndex}`}
            className="flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}
            <span className="ml-1 text-xs">
              {isLoading ? "Loading" : isPlaying ? "Stop" : "Play"}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            disabled={isLoading || !isPlaying}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="flex-shrink-0 w-8 h-8 p-0"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>
        </div>
      </div>

      <div className="mt-2 overflow-x-auto pb-2">
        <div className="flex space-x-2">
          {audioItems.map((audio, audioIndex) => (
            <div
              key={audio.id}
              data-testid={`audio-${audio.id}`}
              className="flex-shrink-0 w-24 flex flex-col"
            >
              <div
                className={cn(
                  "h-16 border-4 rounded-md flex items-center justify-center bg-white p-1 shadow-md",
                  mutedTracks.get(audio.id) ? "border-gray-400" : "border-gray-700",
                  soloedTracks.get(audio.id) && "border-green-500",
                )}
              >
                {audio.url ? (
                  <div
                    className="text-xs text-center text-gray-700 truncate w-full"
                    title={audio.file_name || `Audio ${audioIndex + 1}`}
                  >
                    {audio.file_name || `Audio ${audioIndex + 1}`}
                  </div>
                ) : (
                  <span className="text-xs truncate">{audio.id}</span>
                )}
              </div>
              <div className="flex justify-center mt-1 space-x-1">
                <button
                  onClick={() => toggleTrackMute(audio.id)}
                  className={cn(
                    "w-8 h-6 text-xs font-bold border rounded focus:outline-none",
                    mutedTracks.get(audio.id)
                      ? "bg-yellow-400 border-yellow-600 text-white"
                      : "bg-gray-200 border-gray-400",
                  )}
                  title="Mute"
                >
                  M
                </button>
                <button
                  onClick={() => toggleTrackSolo(audio.id)}
                  className={cn(
                    "w-8 h-6 text-xs font-bold border rounded focus:outline-none",
                    soloedTracks.get(audio.id)
                      ? "bg-green-500 border-green-700 text-white"
                      : "bg-gray-200 border-gray-400",
                  )}
                  title="Solo"
                >
                  S
                </button>
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
                  <Slider
                    defaultValue={[1]}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => handleVolumeChange(audio.id, value)}
                    className="h-full w-2"
                    orientation="vertical"
                  />
                </div>
              </div>
            </div>
          ))}
          {/* Add empty placeholders to make space for up to 8 audio files */}
          {audioItems.length < 8 &&
            Array.from({ length: 8 - audioItems.length }).map((_, i) => (
              <div key={`empty-${i}`} className="flex-shrink-0 w-24 flex flex-col">
                <div className="h-16 border border-dashed rounded-md bg-gray-50"></div>
                <div className="h-7"></div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
