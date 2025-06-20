"use client";

import { AudioUpload } from "@/components/audio/AudioUpload";

export default function AudioUploadPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Audio</h1>

      <AudioUpload />
    </div>
  );
}
