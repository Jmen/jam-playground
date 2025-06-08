"use server";

import { logger } from "@/lib/logger";
import { SupabaseClient } from "@supabase/supabase-js";
import { ErrorCode, Result } from "@/app/api/result";

interface AudioFile {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

interface Loop {
  id: string;
  audio_id: string;
  position: number;
  audio: AudioFile | null;
}

interface Jam {
  id: string;
  name: string;
  description: string;
  created_at: string;
  loops: Loop[];
}

export async function getJamWithLoopsCommand(
  id: string,
  supabase: SupabaseClient,
): Promise<Result<Jam>> {
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
    .select("*")
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

  const { data: loopsData, error: loopsError } = await supabase
    .from("jam_loops")
    .select(
      `
      id,
      audio_id,
      position,
      audio:audio_id (id, file_name, file_type, created_at)
    `,
    )
    .eq("jam_id", jam.id)
    .order("position", { ascending: true });

  const loops = loopsData?.map((loop) => ({
    id: loop.id,
    audio_id: loop.audio_id,
    position: loop.position,
    audio:
      Array.isArray(loop.audio) && loop.audio.length > 0 ? loop.audio[0] : null,
  }));

  if (loopsError) {
    logger.error({ error: loopsError, id: jam.id }, "Failed to fetch loops");
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to fetch loops",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  return {
    data: {
      id: jam.human_readable_id,
      name: jam.name,
      description: jam.description,
      created_at: jam.created_at,
      loops: loops || [],
    },
  };
}
