import { signOutAction } from "@/components/auth/actions";
import { ok, badRequest } from "../../apiResponse";
import { NextRequest } from "next/server";
import { ApiHandlerBuilder, Context } from "../../apiHandlerBuilder";

export const POST = new ApiHandlerBuilder().auth().build(async (_: NextRequest, context?: Context) => {
  const supabase = context?.supabase;

  const result = await signOutAction(supabase);

  if (result?.error) {
    return badRequest(result.error.code, result.error.message);
  }

  return ok({ success: true });
});
