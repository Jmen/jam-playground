"use server";

import { createClient } from "@/lib/supabase/clients/server";
import { ErrorCode, Result } from "@/app/api/result";
import { logger } from "@/lib/logger";
import crypto from "crypto";

export async function uploadAudioFile(file: File): Promise<Result<{ id: string; fileHash: string }>> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
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

  const fileExt = file.name.split(".").pop();
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
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
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

export async function getAudioFiles(): Promise<Result<Array<{
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
}>>> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
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
    .select("id, file_name, file_type, created_at")
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
