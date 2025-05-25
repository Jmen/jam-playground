import { NextRequest } from "next/server";
import { ok, badRequest, internalServerError } from "@/app/api/apiResponse";
import { withAuth, withErrorHandler } from "@/app/api/handlers";
import { logger } from "@/lib/logger";
import { getProfileCommand, updateProfileCommand } from "@/app/api/my/profile/commands";

export const GET = withErrorHandler(
  withAuth(async (request: NextRequest, { supabase }) => {
    const result = await getProfileCommand(supabase);

    if (result?.userError) {
      return badRequest(result.userError.code, result.userError.message);
    }

    if (result?.serverError) {
      logger.error({ error: result.serverError }, "Failed to get profile");
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

    if (result?.userError) {
      return badRequest(result.userError.code, result.userError.message);
    }

    if (result?.serverError) {
      logger.error({ error: result.serverError }, "Failed to update profile");
      return internalServerError();
    }

    return ok({ username: result.data.username });
  }),
);
