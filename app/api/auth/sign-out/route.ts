import { signOutAction } from "@/components/auth/actions";
import { ok, badRequest } from "../../apiResponse";
import { withAuth, withErrorHandler } from "../../handlers";
import { NextRequest } from "next/server";

export const POST = withErrorHandler(
  withAuth(async (_: NextRequest, { supabase }) => {
    const result = await signOutAction(supabase);

    if (result?.error) {
      return badRequest(result.error.code, result.error.message);
    }

    return ok({ success: true });
  }),
);
