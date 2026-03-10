"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { JamCard, type Jam } from "@/components/jams/JamCard";
import { AudioUpload } from "@/components/audio/AudioUpload";
import { api } from "@/lib/api/client";
import { z } from "zod";
import { audioFileSchema } from "@/app/api/audio/schema";

export default function JamDetailPage() {
  const { id } = useParams();
  const [jam, setJam] = useState<Jam | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddLoopModal, setShowAddLoopModal] = useState(false);
  const [audioFiles, setAudioFiles] = useState<
    z.infer<typeof audioFileSchema>[]
  >([]);
  const [selectedAudioIds, setSelectedAudioIds] = useState<string[]>([]);
  const [addingLoop, setAddingLoop] = useState(false);
  const [committingLoopId, setCommittingLoopId] = useState<string | null>(null);
  const [makingPublic, setMakingPublic] = useState(false);

  const fetchJam = async () => {
    const result = await api.jams.get(id as string);
    if (result.data) {
      setJam(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      fetchJam();
    }
  }, [id]);

  const fetchAudioFiles = async () => {
    const result = await api.audio.getAll();
    if (result.data) {
      setAudioFiles(result.data);
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

  const handleCommitLoop = async (loopId: string, audioIds: string[]) => {
    setCommittingLoopId(loopId);
    const result = await api.loops.add(id as string, {
      audio: audioIds.map((audioId) => ({ id: audioId })),
    });
    if (result.data) {
      await fetchJam();
    }
    setCommittingLoopId(null);
  };

  const handleAddLoop = async () => {
    if (selectedAudioIds.length === 0 || !id) return;

    setAddingLoop(true);
    const result = await api.loops.add(id as string, {
      audio: selectedAudioIds.map((audioId) => ({ id: audioId })),
    });

    if (result.data) {
      await fetchJam();
      setShowAddLoopModal(false);
      setSelectedAudioIds([]);
    }
    setAddingLoop(false);
  };

  const handleMakePublic = async () => {
    if (!id) return;

    setMakingPublic(true);
    const result = await api.jams.makePublic(id as string);
    if (result.data) {
      await fetchJam();
    }
    setMakingPublic(false);
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!jam) {
    return <div className="container mx-auto p-4">Jam not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <JamCard
        jam={jam}
        className="mb-6"
        onCommitLoop={handleCommitLoop}
        committingLoopId={committingLoopId}
      />

      <AudioUpload showNavigationButton={false} />

      <div className="mb-6 mt-6">
        <h2 className="text-xl font-semibold mb-2">Loops</h2>

        <div className="flex gap-2">
          <button
            onClick={handleAddLoopClick}
            className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            data-testid="add-loop-button"
          >
            Add Loop
          </button>

          <button
            onClick={handleMakePublic}
            disabled={makingPublic || jam.access === "public"}
            className="mb-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            data-testid="make-public-button"
          >
            {jam.access === "public"
              ? "Public"
              : makingPublic
                ? "Making Public..."
                : "Make Public"}
          </button>
        </div>
      </div>

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
                      selectedAudioIds.includes(audio.id) ? "bg-blue-100" : ""
                    }`}
                    onClick={() => toggleAudioSelection(audio.id)}
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
                disabled={selectedAudioIds.length === 0 || addingLoop}
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
