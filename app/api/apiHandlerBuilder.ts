import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withAuth } from "./wrappers/withAuth";
import { withErrorHandling } from "./wrappers/withErrorHandling";
import { SupabaseClient } from "@supabase/supabase-js";

export interface Context {
  auth: {
    accessToken: string;
    refreshToken: string;
    userId: string;
  };
  supabase: SupabaseClient;
}

export type Handler = (
  req: NextRequest,
  context?: Context,
) => Promise<NextResponse>;

export class ApiHandlerBuilder {
  private _withAuth = false;

  auth(): ApiHandlerBuilder {
    this._withAuth = true;
    return this;
  }

  build(handler: Handler): Handler {
    if (this._withAuth) {
      return withErrorHandling(withAuth(handler));
    }
    return withErrorHandling(handler);
  }
}
