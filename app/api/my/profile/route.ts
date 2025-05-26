import { NextRequest } from "next/server";
import { ok, badRequest, internalServerError } from "@/app/api/apiResponse";
import { withAuth, withErrorHandler } from "@/app/api/handlers";
import { logger } from "@/lib/logger";
import { getProfileCommand, updateProfileCommand } from "@/app/api/my/profile/commands";
import { isServerError, isUserError } from "../../result";

export const GET = withErrorHandler(
  withAuth(async (_request: NextRequest, { supabase }) => {
    const result = await getProfileCommand(supabase);

    if (isUserError(result)) {
      logger.error({ error: result.error }, "Failed to get profile");
      return badRequest(result.error.code, result.error.message);
    }

    if (isServerError(result)) {
      logger.error({ error: result.error }, "Failed to get profile");
      return internalServerError();
    }

    return ok(result.data);
  }),
);

export const POST = withErrorHandler(
  withAuth(async (request: NextRequest, { supabase }) => {
    const { username } = await request.json();

    if (!username) {
      return badRequest("username_is_required", "username not found in request body");
    }

    const result = await updateProfileCommand(username, supabase);

    if (isUserError(result)) {
      logger.error({ error: result.error }, "Failed to update profile");
      return badRequest(result.error.code, result.error.message);
    }

    if (isServerError(result)) {
      logger.error({ error: result.error }, "Failed to update profile");
      return internalServerError();
    }

    return ok({ username: result.data.username });
  }),
);
