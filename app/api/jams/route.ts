import { NextRequest } from "next/server";
import { withAuth, withErrorHandler } from "../wrappers";
import { createJamCommand, getJamsCommand } from "./commands";
import { badRequest, internalServerError, ok } from "../apiResponse";
import { logger } from "@/lib/logger";
import { isServerError, isUserError } from "../result";

export const GET = withErrorHandler(
  withAuth(async (_: NextRequest, { supabase }) => {
    const result = await getJamsCommand(supabase);

    if (isServerError(result)) {
      logger.error({ error: result.error }, "Failed to get jams");
      return internalServerError();
    }

    if (isUserError(result)) {
      logger.error({ error: result.error }, "Failed to get jams");
      return badRequest(result.error.message);
    }

    return ok(result.data);
  }),
);

export const POST = withErrorHandler(
  withAuth(async (request: NextRequest, { supabase }) => {
    const json = await request.json();

    const result = await createJamCommand(json, supabase);

    if (isUserError(result)) {
      logger.error({ error: result.error, body: json }, "Failed to create jam");
      return badRequest(result.error.message);
    }

    if (isServerError(result)) {
      logger.error({ error: result.error, body: json }, "Failed to create jam");
      return internalServerError();
    }

    return ok(result.data);
  }),
);
