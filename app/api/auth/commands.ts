import { SupabaseClient } from "@supabase/supabase-js";

export async function signUpCommand(
  email: string,
  password: string,
  supabase: SupabaseClient,
) {
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
}

export async function signInCommand(
  email: string,
  password: string,
  supabase: SupabaseClient,
) {
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
}

export async function signOutCommand(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: { code: error.code, message: error.message } };
  }

  return { success: true };
}

export async function resetPasswordCommand(
  newPassword: string,
  supabase: SupabaseClient,
) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: { code: error.code, message: error.message } };
  }

  return { success: true };
}

export async function forgotPasswordCommand(
  email: string,
  origin: string,
  supabase: SupabaseClient,
) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    return { error: { code: error.code, message: error.message } };
  }

  return { success: true };
}
