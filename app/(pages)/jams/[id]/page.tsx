"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { JamCard } from "@/components/jams/JamCard";
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
  const [committingLoopId, setCommittingLoopId] = useState<string | null>(null);
  const [makingPublic, setMakingPublic] = useState(false);

  const fetchJam = async () => {
    try {
      const response = await fetch(`/api/jams/${id}`);
      if (response.ok) {
        const body = await response.json();
        setJam(body.data);
      } else {
        console.error("Error fetching jam");
      }
    } catch (error) {
      console.error("Error fetching jam:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJam();
    }
  }, [id]);

  const fetchAudioFiles = async () => {
    try {
      const response = await fetch("/api/audio");
      if (response.ok) {
        const body = await response.json();
        setAudioFiles(body.data);
      } else {
        console.error("Failed to fetch audio files");
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

  const handleCommitLoop = async (loopId: string, audioIds: string[]) => {
    setCommittingLoopId(loopId);
    try {
      const response = await fetch(`/api/jams/${id}/loops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: audioIds.map((audioId) => ({ id: audioId })),
        }),
      });

      if (!response.ok) {
        console.error("Failed to commit loop");
        return;
      }

      await fetchJam();
    } catch (error) {
      console.error("Error committing loop:", error);
    } finally {
      setCommittingLoopId(null);
    }
  };

  const handleAddLoop = async () => {
    if (selectedAudioIds.length === 0 || !id) return;

    setAddingLoop(true);

    try {
      const response = await fetch(`/api/jams/${id}/loops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: selectedAudioIds.map((audioId) => ({ id: audioId })),
        }),
      });

      if (!response.ok) {
        console.error("Failed to add loop");
        return;
      }

      await fetchJam();
      setShowAddLoopModal(false);
      setSelectedAudioIds([]);
    } catch (error) {
      console.error("Error adding loop:", error);
    } finally {
      setAddingLoop(false);
    }
  };

  const handleMakePublic = async () => {
    if (!id) return;

    setMakingPublic(true);

    try {
      const response = await fetch(`/api/jams/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public: true }),
      });

      if (!response.ok) {
        const result = await response.json();
        console.error("Failed to make jam public:", result.error?.message);
        return;
      }

      await fetchJam();
    } catch (error) {
      console.error("Error making jam public:", error);
    } finally {
      setMakingPublic(false);
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
