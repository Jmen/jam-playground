"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/clients/server";
import { SupabaseClient } from "@supabase/supabase-js";

export const getProfileCommand = async (supabase?: SupabaseClient) => {
  const supabaseClient = supabase || (await createClient());

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    logger.warn({ error: userError, user }, "user not found");
    return { userError: { code: "unauthorized", message: "user not found" } };
  }

  const { data, error: profileError } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .limit(1);

  if (profileError) {
    logger.error({ error: profileError, user }, "profile not found");
    return { serverError: { code: profileError.code, message: profileError.message } };
  }

  if (data?.length === 0) {
    return { data: { username: "" } };
  }

  return { data: data[0] };
};

export const updateProfileCommand = async (username: string, supabase?: SupabaseClient) => {
  const supabaseClient = supabase || (await createClient());

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    logger.warn({ error: userError, user, username }, "user not found");
    return { userError: { code: "unauthorized", message: "user not found" } };
  }

  const { data, error } = await supabaseClient
    .from("profiles")
    .upsert({ user_id: user.id, username })
    .select()
    .single();

  if (error) {
    logger.error({ error, user, username }, "error updating profile");
    return { serverError: { code: error.code, message: error.message } };
  }

  return { data };
};
