import { NextRequest } from "next/server";
import { internalServerError, unauthorised } from "../apiResponse";
import { getTokens, getUserId } from "../auth";
import { createClient } from "@/lib/supabase/clients/server";
import { logger } from "@/lib/logger";
import { Handler } from "../apiHandlerBuilder";

export function withAuth(handler: Handler) {
  return async (req: NextRequest) => {
    const hasAuthHeader = req.headers.has("Authorization");

    if (hasAuthHeader) {
      return await withTokenAuth(handler, req);
    }

    return await withCookieAuth(handler, req);
  };
}

async function withTokenAuth(handler: Handler, req: NextRequest) {
  const { accessToken, refreshToken, error: tokenError } = await getTokens(req);

  if (tokenError || !accessToken || !refreshToken) {
    return unauthorised(tokenError);
  }

  const {
    userId,
    client: supabase,
    error: userError,
  } = await getUserId(accessToken, refreshToken);

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
    auth: {
      accessToken,
      refreshToken,
      userId,
    },
    supabase,
  });
}

async function withCookieAuth(handler: Handler, req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return unauthorised("Not authenticated");
  }

  return await handler(req, {
    auth: {
      accessToken: "",
      refreshToken: "",
      userId: user.id,
    },
    supabase,
  });
}
