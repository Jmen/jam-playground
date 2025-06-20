import { SupabaseClient } from "@supabase/supabase-js";
import { Result } from "@/app/api/result";
import { Loop } from "./commands";
import { ErrorCode } from "@/app/api/result";
import { logger } from "@/lib/logger";

export async function insertLoop(
  supabase: SupabaseClient,
  jamId: string,
  userId: string,
  loop: Loop,
): Promise<Result<Loop>> {
  const { data: jams, error: jamError } = await supabase
    .from("jams")
    .select("*")
    .eq("human_readable_id", jamId)
    .limit(1);

  if (jamError) {
    logger.error({ error: jamError }, "Failed to check if jam exists");
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to check if jam exists",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  if (!jams || jams.length === 0) {
    return {
      error: {
        code: "not_found",
        message: "Jam not found",
        type: ErrorCode.CLIENT_ERROR,
      },
    };
  }

  const { data: loopData, error: loopError } = await supabase
    .from("loops")
    .insert({
      jam_id: jams[0].id,
      owner_id: userId,
      name: "Loop",
    })
    .select()
    .single();

  if (loopError || !loopData) {
    logger.error({ error: loopError, jamId, loop }, "Failed to create loop");
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to create loop",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  const audioInserts = loop.audio.map((audio, index) => ({
    loop_id: loopData.id,
    audio_id: audio.id,
    position: index,
  }));

  const { error: audioError } = await supabase
    .from("loop_audio")
    .insert(audioInserts);

  if (audioError) {
    logger.error(
      { error: audioError, jamId, loop, loopId: loopData.id },
      "Failed to add audio to loop",
    );
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to add audio to loop",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  return {
    data: loop,
  };
}
