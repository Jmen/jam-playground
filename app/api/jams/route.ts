import { NextRequest } from "next/server";
import { withAuth, withErrorHandler } from "../handlers";
import { createJamCommand, getJamsCommand } from "./commands";
import { ok } from "../apiResponse";

export const GET = withErrorHandler(
  withAuth(async (_: NextRequest, { supabase }) => {
    const result = await getJamsCommand(supabase);
    return ok(result.data);
  }),
);

export const POST = withErrorHandler(
  withAuth(async (request: NextRequest, { supabase }) => {
    const json = await request.json();

    const result = await createJamCommand(json, supabase);

    return ok(result.data);
  }),
);
