import { logger } from "@/lib/logger";
import { ErrorCode, Result } from "../result";
import { SupabaseClient } from "@supabase/supabase-js";
import { Jam, Loop } from "./commands";

export async function exists(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<boolean>> {
  const { data: jams, error } = await supabase
    .from("jams")
    .select("*")
    .eq("human_readable_id", id)
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

  return {
    data: jams?.length > 0,
  };
}

export async function insertJam(
  supabase: SupabaseClient,
  humanReadableId: string,
  name: string,
  description: string,
  user: { id: string },
): Promise<Result<Jam>> {
  const { data, error } = await supabase
    .from("jams")
    .insert({
      human_readable_id: humanReadableId,
      name,
      description,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error || !data) {
    logger.error(
      { error, data, humanReadableId, name, description, user },
      "Failed to create jam",
    );
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to create jam",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  return {
    data: {
      id: data.human_readable_id,
      name: data.name,
      description: data.description,
      created_at: data.created_at,
    },
  };
}

export async function getJams(
  supabase: SupabaseClient,
): Promise<Result<Jam[]>> {
  const { data: jams, error } = await supabase
    .from("jams")
    .select("*")
    .eq("deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error({ error }, "Failed to get jams");
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to get jams",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  return {
    data:
      jams.map((jam) => ({
        id: jam.human_readable_id,
        name: jam.name,
        description: jam.description,
        created_at: jam.created_at,
      })) || [],
  };
}

export async function getJam(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<Jam>> {
  const { data: jams, error } = await supabase
    .from("jams")
    .select("*")
    .eq("human_readable_id", id)
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

  return {
    data: {
      id: jams?.[0].human_readable_id,
      name: jams?.[0].name,
      description: jams?.[0].description,
      created_at: jams?.[0].created_at,
    },
  };
}

export async function getLoops(
  supabase: SupabaseClient,
  jamId: string,
): Promise<Result<Loop[]>> {
  const { data: loops, error } = await supabase
    .from("jam_loops")
    .select("id, audio_id, position, jams (id, human_readable_id)")
    .eq("jams.human_readable_id", jamId)
    .order("position", { ascending: true });

  if (error) {
    logger.error({ error }, "Failed to get jam loops");
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to get jam loops",
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  return {
    data: loops,
  };
}
