import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { internalServerError, unauthorised } from "./apiResponse";
import { getTokens, getUserId } from "./auth";
import { logger } from "@/lib/logger";

export interface AuthContext {
  accessToken: string;
  refreshToken: string;
  userId: string;
  supabase: SupabaseClient;
}

export type Handler = (req: NextRequest) => Promise<NextResponse>;
export type AuthHandler = (req: NextRequest, context: AuthContext) => Promise<NextResponse>;

export function withErrorHandler(handler: Handler) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      logger.error({ error }, "Unhandled API error");
      return internalServerError();
    }
  };
}

export function withAuth(handler: AuthHandler) {
  return async (req: NextRequest) => {
    const { accessToken, refreshToken, error: tokenError } = await getTokens(req);

    if (tokenError || !accessToken || !refreshToken) {
      return unauthorised(tokenError);
    }

    const { userId, client: supabase, error: userError } = await getUserId(accessToken, refreshToken);

    if (userError) {
      logger.error({ userError }, "Invalid token");
      return unauthorised("invalid token");
    }

    if (!userId) {
      logger.error({}, "Error getting userId");
      return internalServerError();
    }

    if (!supabase) {
      logger.error({}, "Error creating supabase client");
      return internalServerError();
    }

    return await handler(req, {
      accessToken,
      refreshToken,
      userId,
      supabase,
    });
  };
}
