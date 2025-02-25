"use server";

import { createClient } from "@/lib/supabase/clients/server";
import { SupabaseClient } from "@supabase/supabase-js";

export const getProfileAction = async (supabase?: SupabaseClient) => {
  const supabaseClient = supabase || (await createClient());

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    return { error: { code: "unauthorized", message: "user not found" } };
  }

  const { data, error: profileError } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .limit(1);

  if (profileError) {
    return { error: { code: profileError.code, message: profileError.message } };
  }

  if (data?.length === 0) {
    return { data: { username: "" } };
  }

  return { data: data[0] };
};

export const updateProfileAction = async (username: string, supabase?: SupabaseClient) => {
  const supabaseClient = supabase || (await createClient());

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    return { error: { code: "unauthorized", message: "user not found" } };
  }

  const { data, error } = await supabaseClient
    .from("profiles")
    .upsert({ user_id: user.id, username })
    .select()
    .single();

  if (error) {
    return { error: { code: error.code, message: error.message } };
  }

  return { data };
};
