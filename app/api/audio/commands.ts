"use server";

import { logger } from "@/lib/logger";
import { SupabaseClient } from "@supabase/supabase-js";
import { ErrorCode, Result } from "@/app/api/result";
import crypto from "crypto";

interface AudioFile {
  id: string;
  owner_id: string;
  created_at: string;
  file_hash: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export async function uploadAudioCommand(
  {
    file,
    fileName,
    fileType,
    fileSize,
  }: { file: File; fileName: string; fileType: string; fileSize: number },
  supabase: SupabaseClient,
): Promise<Result<{ id: string; fileHash: string }>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: {
        code: "unauthorized",
        message: "User not authenticated",
        type: ErrorCode.CLIENT_ERROR,
      },
    };
  }

  const buffer = await file.arrayBuffer();
  const hash = crypto
    .createHash("sha256")
    .update(Buffer.from(buffer))
    .digest("hex");

  const fileExt = fileName.split(".").pop();
  const filePath = `${hash}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("audio-files")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError && uploadError.message !== "The resource already exists") {
    logger.error({ error: uploadError }, "Failed to upload audio file");
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to upload audio file",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  const { data: audioFile, error: dbError } = await supabase
    .from("audio_files")
    .insert({
      owner_id: user.id,
      file_hash: hash,
      file_path: filePath,
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
    })
    .select()
    .single();

  if (dbError || !audioFile) {
    logger.error({ error: dbError }, "Failed to store audio file metadata");
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to store audio file metadata",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  return {
    data: {
      id: audioFile.id,
      fileHash: hash,
    },
  };
}

export async function getAudioFilesCommand(
  supabase: SupabaseClient,
): Promise<Result<AudioFile[]>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: {
        code: "unauthorized",
        message: "User not authenticated",
        type: ErrorCode.CLIENT_ERROR,
      },
    };
  }

  // Get all audio files for the user
  const { data: audioFiles, error } = await supabase
    .from("audio_files")
    .select("*")
    .eq("owner_id", user.id)
    .eq("deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error({ error }, "Failed to fetch audio files");
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to fetch audio files",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  return {
    data: audioFiles,
  };
}
