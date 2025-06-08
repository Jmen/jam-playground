"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getJamData, addLoopToJam, getAudioFiles } from "./server";
import { JamCard } from "@/components/JamCard";
import { isOk, isError } from "@/app/api/result";

interface AudioFile {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

import type { Jam as JamCardType } from "@/components/JamCard";

type Jam = JamCardType & {
  loops: { audioId: string }[];
};

export default function JamDetailPage() {
  const { id } = useParams();
  const [jam, setJam] = useState<Jam | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddLoopModal, setShowAddLoopModal] = useState(false);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
  const [addingLoop, setAddingLoop] = useState(false);

  useEffect(() => {
    const fetchJam = async () => {
      try {
        const result = await getJamData(id as string);
        if (isOk(result)) {
          const jamData: Jam = {
            id: result.data.id,
            name: result.data.name,
            description: result.data.description,
            created_at: result.data.created_at,
            loops:
              result.data.loops?.map((loop) => ({
                audioId: loop.audioId,
              })) || [],
          };
          setJam(jamData);
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
      const result = await getAudioFiles();
      if (isOk(result)) {
        setAudioFiles(result.data);
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

  const handleAddLoop = async () => {
    if (!selectedAudioId || !id) return;

    setAddingLoop(true);

    try {
      const result = await addLoopToJam(id as string, selectedAudioId);

      if (isOk(result)) {
        const updatedJam: Jam = {
          id: result.data.id,
          name: result.data.name,
          description: result.data.description,
          created_at: result.data.created_at,
          loops:
            result.data.loops?.map((loop) => ({
              audioId: loop.audioId,
            })) || [],
        };
        setJam(updatedJam);
        setShowAddLoopModal(false);
        setSelectedAudioId(null);
      } else if (isError(result)) {
        console.error("Failed to add loop:", result.error.message);
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

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Loops</h2>

        <button
          onClick={handleAddLoopClick}
          className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          data-testid="add-loop-button"
        >
          Add Loop
        </button>

        {jam.loops && jam.loops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jam.loops.map((loop, index) => (
              <div
                key={index}
                data-testid={`loop-${loop.audioId}`}
                className="border rounded p-4 bg-gray-50"
              >
                <p className="font-medium">Audio ID: {loop.audioId}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No loops added yet.</p>
        )}
      </div>

      {/* Add Loop Modal */}
      {showAddLoopModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Loop</h3>

            {audioFiles.length > 0 ? (
              <div className="mb-4 max-h-60 overflow-y-auto">
                {audioFiles.map((audio) => (
                  <div
                    key={audio.id}
                    data-testid={`audio-item-${audio.id}`}
                    className={`p-2 border-b cursor-pointer ${
                      selectedAudioId === audio.id ? "bg-blue-100" : ""
                    }`}
                    onClick={() => setSelectedAudioId(audio.id)}
                  >
                    <p className="font-medium">{audio.file_name}</p>
                    <p className="text-xs text-gray-500">{audio.file_type}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-4">
                No audio files available. Upload some first.
              </p>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddLoopModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLoop}
                disabled={!selectedAudioId || addingLoop}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
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
