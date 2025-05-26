import { NextRequest } from "next/server";
import { withAuth, withErrorHandler } from "../handlers";
import { createJamCommand, getJamsCommand } from "./commands";
import { internalServerError, ok } from "../apiResponse";
import { logger } from "@/lib/logger";

export const GET = withErrorHandler(
  withAuth(async (_: NextRequest, { supabase }) => {
    const result = await getJamsCommand(supabase);

    if ("serverError" in result) {
      logger.error({ error: result.serverError }, "Failed to get jams");
      return internalServerError();
    }

    return ok(result.data);
  }),
);

export const POST = withErrorHandler(
  withAuth(async (request: NextRequest, { supabase }) => {
    const json = await request.json();

    const result = await createJamCommand(json, supabase);

    if ("serverError" in result) {
      logger.error({ error: result.serverError, body: json }, "Failed to create jam");
      return internalServerError();
    }

    return ok(result.data);
  }),
);
