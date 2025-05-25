import { NextRequest } from "next/server";
import { withAuth, withErrorHandler } from "../handlers";
import { createJamAction, getJamsAction } from "./actions";
import { ok } from "../apiResponse";

export const GET = withErrorHandler(
  withAuth(async (_: NextRequest, { supabase }) => {
    const result = await getJamsAction(supabase);
    return ok(result);
  }),
);

export const POST = withErrorHandler(
  withAuth(async (request: NextRequest, { supabase }) => {
    const json = await request.json();

    const result = await createJamAction(json, supabase);

    return ok(result.data);
  }),
);
