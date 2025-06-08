"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/clients/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { ErrorCode, isError, Result } from "../result";
import { exists, getJam, getJams, getLoops, insertJam } from "./db";
import { JamId } from "./jamId";

export interface Jam {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Loop {
  id: string;
  audio_id: string;
  position: number;
}

export async function getJamsCommand(
  supabase?: SupabaseClient,
): Promise<Result<Jam[]>> {
  if (!supabase) {
    supabase = await createClient();
  }

  return getJams(supabase);
}

export async function getJamCommand(id: string): Promise<
  Result<{
    id: string;
    name: string;
    description: string;
    created_at: string;
    loops?: { audioId: string }[];
  }>
> {
  const supabase = await createClient();

  const getJamResult = await getJam(supabase, id);

  if (isError(getJamResult)) {
    return getJamResult;
  }

  if (getJamResult.data) {
    const jam = getJamResult.data;

    const getLoopsResult = await getLoops(supabase, jam.id);

    if (isError(getLoopsResult)) {
      return getLoopsResult;
    }

    const loops = getLoopsResult.data;

    return {
      data: {
        id: jam.id,
        name: jam.name,
        description: jam.description,
        created_at: jam.created_at,
        loops: loops?.map((loop) => ({ audioId: loop.audio_id })) || [],
      },
    };
  }

  logger.warn({ id }, "Jam not found");

  return {
    error: {
      code: "not_found",
      message: "Jam not found",
      type: ErrorCode.CLIENT_ERROR,
    },
  };
}

export async function createJamCommand(
  { name, description }: { name: string; description: string },
  supabase: SupabaseClient,
): Promise<
  Result<{ id: string; name: string; description: string; created_at: string }>
> {
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

  let candidateId;
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    candidateId = JamId.generateUniqueId();

    const existingResult = await exists(supabase, candidateId);

    if (isError(existingResult)) {
      logger.error(
        { error: existingResult.error, candidateId },
        "Failed to check ID uniqueness",
      );
      return existingResult;
    }

    if (existingResult.data === false) {
      break;
    }
  }

  return await insertJam(supabase, candidateId!, name, description, user);
}
