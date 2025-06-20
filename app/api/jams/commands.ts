"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/clients/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { ErrorCode, isError, Result } from "../result";
import { exists, getJams, insertJam } from "./db";
import { JamId } from "./jamId";

export interface Jam {
  id: string;
  name: string;
  description: string;
  created_at: string;
  db_id?: number;
  loops?: {
    audio: {
      id: string;
    }[];
  }[];
}

export async function getJamsCommand(
  supabase?: SupabaseClient,
): Promise<Result<Jam[]>> {
  if (!supabase) {
    supabase = await createClient();
  }

  return getJams(supabase);
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
