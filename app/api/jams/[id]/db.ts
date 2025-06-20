import { ErrorCode, Result } from "@/app/api/result";
import { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

interface Jam {
  id: string;
  name: string;
  description: string;
  created_at: string;
  loops: Loop[];
}

interface Loop {
  audio: {
    id: string;
  }[];
}

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
          audio(id, deleted)
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

  const loops = jam.loops.map((loop) => ({
    audio: loop.loop_audio.map((assoc: { audio_id: string }) => ({
      id: assoc.audio_id,
    })),
  }));

  return {
    data: {
      id: jam.human_readable_id,
      name: jam.name,
      description: jam.description,
      created_at: jam.created_at,
      loops,
    },
  };
}
