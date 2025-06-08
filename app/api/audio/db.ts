import { ErrorCode } from "@/app/api/result";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { Result } from "../result";
import { AudioFile } from "./commands";

export async function insertAudio(
  supabaseClient: SupabaseClient,
  user: User,
  hash: string,
  filePath: string,
  fileName: string,
  fileSize: number,
  fileType: string,
): Promise<Result<AudioFile>> {
  const { data: audioFile, error: dbError } = await supabaseClient
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
      owner_id: audioFile.owner_id,
      created_at: audioFile.created_at,
      file_hash: audioFile.file_hash,
      file_path: audioFile.file_path,
      file_name: audioFile.file_name,
      file_size: audioFile.file_size,
      file_type: audioFile.file_type,
    },
  };
}

export async function getAudio(
  supabaseClient: SupabaseClient,
  user: User,
): Promise<Result<AudioFile[]>> {
  const { data: audioFiles, error } = await supabaseClient
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
