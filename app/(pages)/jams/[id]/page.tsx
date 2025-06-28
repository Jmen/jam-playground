"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getJamCommand } from "@/app/api/jams/[id]/commands";
import { addLoopToJamCommand, Loop } from "@/app/api/jams/[id]/loops/commands";
import { getAudioCommand } from "@/app/api/audio/commands";
import { JamCard } from "@/components/jams/JamCard";
import { isOk, isError } from "@/app/api/result";
import { AudioUpload } from "@/components/audio/AudioUpload";

interface AudioFile {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

import type { Jam as JamCardType } from "@/components/jams/JamCard";

type Jam = JamCardType;

export default function JamDetailPage() {
  const { id } = useParams();
  const [jam, setJam] = useState<Jam | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddLoopModal, setShowAddLoopModal] = useState(false);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [selectedAudioIds, setSelectedAudioIds] = useState<string[]>([]);
  const [addingLoop, setAddingLoop] = useState(false);

  useEffect(() => {
    const fetchJam = async () => {
      try {
        const result = await getJamCommand(id as string);

        if (isOk(result)) {
          setJam(result.data);
        } else if (isError(result)) {
          console.error("Error fetching jam:", result.error.message);
        }
      } catch (error) {
        console.error("Error fetching jam:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJam();
    }
  }, [id]);

  const fetchAudioFiles = async () => {
    try {
      const result = await getAudioCommand();
      if (isOk(result)) {
        const files = result.data.map((file: AudioFile) => ({
          id: file.id,
          file_name: file.file_name,
          file_type: file.file_type,
          created_at: file.created_at,
        }));
        setAudioFiles(files);
      } else if (isError(result)) {
        console.error("Failed to fetch audio files:", result.error.message);
      }
    } catch (error) {
      console.error("Error fetching audio files:", error);
    }
  };

  const handleAddLoopClick = () => {
    fetchAudioFiles();
    setShowAddLoopModal(true);
  };

  const toggleAudioSelection = (audioId: string) => {
    setSelectedAudioIds((prev) => {
      if (prev.includes(audioId)) {
        return prev.filter((id) => id !== audioId);
      } else {
        return [...prev, audioId];
      }
    });
  };

  const handleAddLoop = async () => {
    if (selectedAudioIds.length === 0 || !id) return;

    setAddingLoop(true);

    try {
      const loop: Loop = {
        audio: selectedAudioIds.map((id) => ({ id })),
      };

      const addResult = await addLoopToJamCommand(id as string, loop);

      if (isError(addResult)) {
        console.error("Failed to add loop:", addResult.error.message);
        return;
      }

      const jamResult = await getJamCommand(id as string);

      if (isOk(jamResult)) {
        setJam(jamResult.data);
        setShowAddLoopModal(false);
        setSelectedAudioIds([]);
      } else if (isError(jamResult)) {
        console.error("Failed to get updated jam:", jamResult.error.message);
      }
    } catch (error) {
      console.error("Error adding loop:", error);
    } finally {
      setAddingLoop(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!jam) {
    return <div className="container mx-auto p-4">Jam not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <JamCard jam={jam} className="mb-6" />

      <AudioUpload showNavigationButton={false} />

      <div className="mb-6 mt-6">
        <h2 className="text-xl font-semibold mb-2">Loops</h2>

        <button
          onClick={handleAddLoopClick}
          className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          data-testid="add-loop-button"
        >
          Add Loop
        </button>
      </div>

      {showAddLoopModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Loop</h3>

            {audioFiles.length > 0 ? (
              <div className="mb-4 max-h-60 overflow-y-auto">
                {audioFiles.map((audio) => {
                  const audioItemClass = `p-2 border-b cursor-pointer ${selectedAudioIds.includes(audio.id) ? 'bg-accent text-accent-foreground' : ''}`;
                  return (
                    <div
                      key={audio.id}
                      data-testid={`audio-item-${audio.id}`}
                      className={audioItemClass}
                      onClick={() => toggleAudioSelection(audio.id)}
                    >
                      <p className="font-medium">{audio.file_name}</p>
                      <p className="text-xs text-gray-500">{audio.file_type}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mb-4">
                No audio files available. Upload some first.
              </p>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddLoopModal(false)}
                className="px-4 py-2 border rounded bg-secondary text-secondary-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLoop}
                disabled={selectedAudioIds.length === 0 || addingLoop}
                className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
              >
                {addingLoop ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
