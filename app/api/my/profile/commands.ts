"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/clients/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { ErrorCode, Result } from "../../result";
import { getProfile, upsertProfile } from "./db";
import { isError } from "../../result";

export interface Profile {
  username: string;
}

export const getProfileCommand = async (
  supabase?: SupabaseClient,
): Promise<Result<Profile>> => {
  const supabaseClient = supabase || (await createClient());

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    logger.warn({ error: userError, user }, "user not found");
    return {
      error: {
        code: "unauthorized",
        message: "user not found",
        type: ErrorCode.CLIENT_ERROR,
      },
    };
  }

  const result = await getProfile(supabaseClient, user.id);

  if (isError(result) && result.error?.code === "not_found") {
    return {
      data: {
        username: "",
      },
    };
  }

  return result;
};

export const updateProfileCommand = async (
  username: string,
  supabase?: SupabaseClient,
): Promise<Result<{ username: string }>> => {
  const supabaseClient = supabase || (await createClient());

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    logger.warn({ error: userError, user, username }, "user not found");
    return {
      error: {
        code: "unauthorized",
        message: "user not found",
        type: ErrorCode.CLIENT_ERROR,
      },
    };
  }

  return await upsertProfile(supabaseClient, user.id, username);
};
