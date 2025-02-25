"use server";

import { createClient } from "@/lib/supabase/clients/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const redirectIfNotLoggedIn = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/");
  }
};

export const signUpAction = async (email: string, password: string) => {
  const supabase = await createClient();
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return { error: { code: signUpError.code, message: signUpError.message } };
  }

  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: { code: signInError.code, message: signInError.message } };
  }

  return {
    session: {
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
    },
  };
};

export const signInAction = async (email: string, password: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: { code: error.code, message: error.message } };
  }

  return {
    session: {
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
    },
  };
};

export const signOutAction = async (supabase?: SupabaseClient) => {
  const supabaseClient = supabase || (await createClient());

  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    return { error: { code: error.code, message: error.message } };
  }

  return { success: true };
};

export const resetPasswordAction = async (newPassword: string, supabase?: SupabaseClient) => {
  const supabaseClient = supabase || (await createClient());

  const { error } = await supabaseClient.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: { code: error.code, message: error.message } };
  }

  return { success: true };
};

export const forgotPasswordAction = async (email: string) => {
  const origin = (await headers()).get("origin");
  const redirectOrigin = origin?.replace("127.0.0.1", "localhost");
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${redirectOrigin}/api/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    return { error: { code: error.code, message: error.message } };
  }

  return { success: true };
};

export const signInWithGoogleAction = async () => {
  const origin = (await headers()).get("origin");
  const redirectOrigin = origin?.replace("127.0.0.1", "localhost");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${redirectOrigin}/api/auth/callback?next=/account`,
      queryParams: {
        prompt: "select_account",
        access_type: "offline",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
};

export async function getAuthProvidersAction() {
  return {
    google: process.env.USE_GOOGLE_AUTH === "true",
  };
}
