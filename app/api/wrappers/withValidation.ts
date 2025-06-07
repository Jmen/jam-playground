import { NextRequest } from "next/server";
import { z } from "zod";
import { badRequest } from "../apiResponse";
import { Handler, Context } from "../apiHandlerBuilder";

export interface ValidationSchemas {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
}

// Generic helper functions for type-safe access to validated data
export function getTypedBody<T extends z.ZodType>(
  context: Context,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _schema: T,
): z.infer<T> {
  return context.validated?.body as z.infer<T>;
}

export function getTypedQuery<T extends z.ZodType>(
  context: Context,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _schema: T,
): z.infer<T> {
  return context.validated?.query as z.infer<T>;
}

export function withValidation(schemas: ValidationSchemas) {
  return function (handler: Handler) {
    return async (req: NextRequest, context: Context) => {
      const validated: Record<string, unknown> = {};

      try {
        if (schemas.body) {
          const body = await req.json();
          validated.body = schemas.body.parse(body);
        }

        if (schemas.query) {
          const url = new URL(req.url);
          const queryParams = Object.fromEntries(url.searchParams.entries());
          validated.query = schemas.query.parse(queryParams);
        }

        const enhancedContext: Context = {
          ...context,
          validated,
        } as Context;

        return await handler(req, enhancedContext);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorDetails = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));

          return badRequest(
            "validation_error",
            `Validation failed: ${errorDetails.map((e) => `${e.field}: ${e.message}`).join(", ")}`,
          );
        }
        throw error;
      }
    };
  };
}
