import { SupabaseClient } from "@supabase/supabase-js";
import { ErrorCode, Result } from "@/app/api/result";
import { logger } from "@/lib/logger";

import { Audio, SignedUrls } from "./domain";

const ONE_HOUR = 3600;

export async function getSignedUrls(
  supabaseClient: SupabaseClient,
  inputAudio: Audio[],
): Promise<Result<SignedUrls[]>> {
  try {
    const urls: SignedUrls[] = [];

    for (const audio of inputAudio) {
      const { data, error } = await supabaseClient.storage
        .from("audio-files")
        .createSignedUrl(audio.file_path, ONE_HOUR, {
          download: true,
        });

      const { data: fileData } = await supabaseClient
        .from("audio")
        .select("file_name")
        .eq("id", audio.id)
        .single();

      if (error || !data) {
        return {
          error: {
            code: "audio_url_generation_failed",
            message: "Failed to generate audio URLs",
            type: ErrorCode.SERVER_ERROR,
          },
        };
      }

      urls.push({
        id: audio.id,
        url: data.signedUrl,
        file_name: fileData?.file_name || undefined,
      });
    }

    return {
      data: urls,
    };
  } catch (error) {
    logger.error({ error, inputAudio }, "Failed to generate audio URLs");
    return {
      error: {
        code: "audio_url_generation_failed",
        message: "Failed to generate audio URLs",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }
}
