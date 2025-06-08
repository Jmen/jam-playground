import { ErrorCode } from "@/app/api/result";
import { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { Result } from "../result";

export async function uploadAudio(
  supabaseClient: SupabaseClient,
  filePath: string,
  file: File,
): Promise<Result<{ id: string }>> {
  const { error: uploadError } = await supabaseClient.storage
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

  return {
    data: {
      id: filePath,
    },
  };
}
