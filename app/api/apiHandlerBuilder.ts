import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withAuth } from "./wrappers/withAuth";
import { withErrorHandling } from "./wrappers/withErrorHandling";
import { withValidation, ValidationSchemas } from "./wrappers/withValidation";
import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export interface Context {
  auth: {
    accessToken: string;
    refreshToken: string;
    userId: string;
  };
  supabase: SupabaseClient;
  validated?: {
    body?: unknown;
    query?: unknown;
  };
}

export type Handler = (
  req: NextRequest,
  context: Context,
) => Promise<NextResponse>;

export class ApiHandlerBuilder {
  private _withAuth = false;
  private _validationSchemas: ValidationSchemas = {};

  auth(): ApiHandlerBuilder {
    this._withAuth = true;
    return this;
  }

  validateBody(schema: z.ZodType): ApiHandlerBuilder {
    this._validationSchemas.body = schema;
    return this;
  }

  validateQuery(schema: z.ZodType): ApiHandlerBuilder {
    this._validationSchemas.query = schema;
    return this;
  }

  build(handler: Handler): Handler {
    let wrappedHandler = handler;

    if (this._validationSchemas.body || this._validationSchemas.query) {
      wrappedHandler = withValidation(this._validationSchemas)(wrappedHandler);
    }

    if (this._withAuth) {
      wrappedHandler = withAuth(wrappedHandler);
    }

    return withErrorHandling(wrappedHandler);
  }
}
