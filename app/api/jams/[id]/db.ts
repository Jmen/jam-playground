import { ErrorCode, Result } from "@/app/api/result";
import { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { Jam } from "./domain";

export async function getJam(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<Jam>> {
  const { data: jams, error } = await supabase
    .from("jams")
    .select(
      `
      human_readable_id,
      name,
      description,
      created_at,
      loops(id, created_at, 
        loop_audio(audio_id, position, deleted, 
          audio(id, file_path, deleted)
        )
      )
    `,
    )
    .eq("human_readable_id", id)
    .eq("deleted", false)
    .eq("loops.deleted", false)
    .eq("loops.loop_audio.deleted", false)
    .order("created_at", { ascending: false, referencedTable: "loops" })
    .limit(1);

  if (error) {
    logger.error({ error }, "Failed to get jam");
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to get jam",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  if (!jams?.length) {
    return {
      error: {
        code: "not_found",
        message: "Jam not found",
        type: ErrorCode.CLIENT_ERROR,
      },
    };
  }

  const jam = jams[0];

  return {
    data: new Jam(
      jam.human_readable_id,
      jam.name,
      jam.description,
      jam.created_at,
      jam.loops.map((loop) => ({
        id: loop.id,
        created_at: loop.created_at,
        audio: loop.loop_audio.map((loop_audio: { audio: { id: string; file_path: string; }; }) => ({
          id: loop_audio.audio.id,
          file_path: loop_audio.audio.file_path,
        })),
      })),
    ),
  };
}
