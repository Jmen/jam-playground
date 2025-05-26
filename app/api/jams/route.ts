import { NextRequest } from "next/server";
import { createJamCommand, getJamsCommand } from "./commands";
import { badRequest, internalServerError, ok } from "../apiResponse";
import { logger } from "@/lib/logger";
import { isServerError, isUserError } from "../result";
import { ApiHandlerBuilder, Context } from "../apiHandlerBuilder";

export const GET = new ApiHandlerBuilder().auth().build(async (_: NextRequest, context?: Context) => {
  const supabase = context?.supabase;

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
});

export const POST = new ApiHandlerBuilder().auth().build(async (request: NextRequest, context?: Context) => {
  const supabase = context?.supabase;

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
});
