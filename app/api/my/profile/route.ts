import { NextRequest } from "next/server";
import { ok, badRequest, internalServerError } from "@/app/api/apiResponse";
import { withAuth, withErrorHandler } from "@/app/api/handlers";
import { logger } from "@/lib/logger";
import { getProfileAction, updateProfileAction } from "@/components/profile/actions";

export const GET = withErrorHandler(
  withAuth(async (request: NextRequest, { supabase }) => {
    const result = await getProfileAction(supabase);

    if (result.error) {
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

    const result = await updateProfileAction(username, supabase);

    if (result?.error) {
      return badRequest(result.error.code, result.error.message);
    }

    return ok({ username: result.data.username });
  }),
);
