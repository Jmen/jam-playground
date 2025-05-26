"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/clients/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { ErrorCode, Result } from "../../result";

export const getProfileCommand = async (
  supabase?: SupabaseClient,
): Promise<Result<{ username: string }>> => {
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
        type: ErrorCode.USER_ERROR,
      },
    };
  }

  const { data, error: profileError } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .limit(1);

  if (profileError) {
    logger.error({ error: profileError, user }, "profile not found");
    return {
      error: {
        code: profileError.code,
        message: profileError.message,
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  if (data?.length === 0) {
    return { data: { username: "" } };
  }

  return { data: data[0] };
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
        type: ErrorCode.USER_ERROR,
      },
    };
  }

  const { data, error } = await supabaseClient
    .from("profiles")
    .upsert({ user_id: user.id, username })
    .select()
    .single();

  if (error) {
    logger.error({ error, user, username }, "error updating profile");
    return {
      error: {
        code: error.code,
        message: error.message,
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  return { data };
};
