"use server";

import { logger } from "@/lib/logger";
import { SupabaseClient } from "@supabase/supabase-js";
import { ErrorCode, Result } from "@/app/api/result";

export async function addLoopToJamCommand(
  id: string,
  audioId: string,
  supabase: SupabaseClient,
): Promise<Result<{ id: string }>> {
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

  const { data: jams, error: jamError } = await supabase
    .from("jams")
    .select("id")
    .eq("human_readable_id", id)
    .eq("owner_id", user.id)
    .limit(1);

  if (jamError || !jams || jams.length === 0) {
    logger.error({ error: jamError, id }, "Failed to find jam");
    return {
      error: {
        code: "not_found",
        message: "Jam not found or access denied",
        type: ErrorCode.CLIENT_ERROR,
      },
    };
  }

  const jam = jams[0];

  const { data: audio, error: audioError } = await supabase
    .from("audio_files")
    .select("id")
    .eq("id", audioId)
    .eq("owner_id", user.id)
    .single();

  if (audioError || !audio) {
    logger.error({ error: audioError, audioId }, "Failed to find audio file");
    return {
      error: {
        code: "not_found",
        message: "Audio file not found or access denied",
        type: ErrorCode.CLIENT_ERROR,
      },
    };
  }

  const { data: loopsCount, error: countError } = await supabase
    .from("jam_loops")
    .select("id", { count: "exact" })
    .eq("jam_id", jam.id);

  if (countError) {
    logger.error(
      { error: countError, id, audioId },
      "Failed to get loop count",
    );
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to get loop count",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  const position = loopsCount ? loopsCount.length : 0;

  const { data: loop, error: loopError } = await supabase
    .from("jam_loops")
    .insert({
      jam_id: jam.id,
      audio_id: audioId,
      position,
    })
    .select()
    .single();

  if (loopError || !loop) {
    logger.error(
      { error: loopError, id, audioId },
      "Failed to add loop to jam",
    );
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to add loop to jam",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  return {
    data: {
      id: loop.id,
    },
  };
}
