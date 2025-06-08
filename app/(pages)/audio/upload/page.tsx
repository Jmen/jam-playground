"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadAudioCommand } from "@/app/api/audio/commands";
import { isOk, isUserError, isServerError } from "@/app/api/result";

export default function AudioUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [audioId, setAudioId] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const result = await uploadAudioCommand({
        file,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      if (isOk(result)) {
        setAudioId(result.data.id);
      } else if (isUserError(result) || isServerError(result)) {
        console.error("Upload failed:", result.error.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Audio</h1>

      <div className="mb-4">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {audioId && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p>Audio uploaded successfully!</p>
          <p>
            Audio ID: <span data-testid="audio-id">{audioId}</span>
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}
