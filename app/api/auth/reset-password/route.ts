import { resetPasswordAction } from "@/components/auth/actions";
import { NextRequest } from "next/server";
import { badRequest, ok } from "@/app/api/apiResponse";
import { ApiHandlerBuilder, Context } from "@/app/api/apiHandlerBuilder";

export const POST = new ApiHandlerBuilder().auth().build(async (request: NextRequest, context?: Context) => {
  const supabase = context?.supabase;

  const { password } = await request.json();

  const result = await resetPasswordAction(password, supabase);

  if (result?.error) {
    return badRequest(result.error.code, result.error.message);
  }

  return ok();
});
