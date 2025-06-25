import { logger } from "@/lib/logger";
import { Context, Handler } from "../apiHandlerBuilder";
import { NextRequest } from "next/server";
import { internalServerError } from "../apiResponse";

export function withErrorHandling(handler: Handler) {
  return async (req: NextRequest, context: Context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      logger.error(error, "Unhandled API error");
      return internalServerError();
    }
  };
}
