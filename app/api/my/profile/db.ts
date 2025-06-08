import { Profile } from "./commands";
import { Result } from "../../result";
import { SupabaseClient } from "@supabase/supabase-js";
import { ErrorCode } from "../../result";
import { logger } from "@/lib/logger";

export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<Profile>> {
  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .limit(1);

  if (profileError) {
    logger.error({ error: profileError, userId }, "profile not found");
    return {
      error: {
        code: profileError.code,
        message: profileError.message,
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  if (!data?.length) {
    return {
      error: {
        code: "not_found",
        message: "profile not found",
        type: ErrorCode.CLIENT_ERROR,
      },
    };
  }

  return {
    data: {
      username: data?.[0].username,
    },
  };
}

export async function upsertProfile(
  supabase: SupabaseClient,
  userId: string,
  username: string,
): Promise<Result<Profile>> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ user_id: userId, username })
    .select()
    .single();

  if (error) {
    logger.error({ error, userId, username }, "error updating profile");
    return {
      error: {
        code: error.code,
        message: error.message,
        type: ErrorCode.SERVER_ERROR,
      },
    };
  }

  return {
    data: {
      username: data?.username,
    },
  };
}
