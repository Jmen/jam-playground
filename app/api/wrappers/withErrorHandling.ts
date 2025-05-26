import { logger } from "@/lib/logger";
import { Handler } from "../apiHandlerBuilder";
import { NextRequest } from "next/server";
import { internalServerError } from "../apiResponse";

export function withErrorHandling(handler: Handler) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      logger.error({ error }, "Unhandled API error");
      return internalServerError();
    }
  };
}
