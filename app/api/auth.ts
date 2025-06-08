import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/clients/server";
import { logger } from "@/lib/logger";
import { AuthApiError } from "@supabase/supabase-js";

export async function getTokens(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const refreshToken = request.headers.get("X-Refresh-Token");

  if (!authHeader?.startsWith("Bearer ")) {
    logger.error({ authHeader }, "Token does not begin with {Bearer}");
    return { error: "Token does not begin with {Bearer}" };
  }

  if (!refreshToken) {
    return { error: "Refresh token required" };
  }

  const accessToken = authHeader.split(" ")[1];

  return { accessToken, refreshToken };
}

export async function getUserId(accessToken: string, refreshToken: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      logger.error(
        { error },
        "Failed to set session, supabase returned an error",
      );
      return { error: { code: error.code, message: error.message } };
    }
  } catch (error) {
    if (error instanceof AuthApiError) {
      logger.error(
        { error },
        "Failed to set session, supabase threw an AuthApiError error",
      );
      return { error: { code: error.code, message: error.message } };
    }

    logger.error({ error }, "Failed to set session, supabase threw an error");
    return {
      error: {
        code: "internal_server_error",
        message: "Failed to set session",
      },
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    logger.error({ error }, "Failed to get user, supabase returned an error");
    return { error: { code: error.code, message: error.message } };
  }

  if (!user?.id) {
    logger.error({ user }, "User not found, supabase data response is empty");
    return { error: { code: "user_not_found", message: "User not found" } };
  }

  return { userId: user.id, client: supabase };
}
