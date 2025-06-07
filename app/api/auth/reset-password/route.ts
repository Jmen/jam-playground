import { resetPasswordAction } from "@/components/auth/actions";
import { NextRequest } from "next/server";
import { badRequest, ok } from "@/app/api/apiResponse";
import { ApiHandlerBuilder, Context } from "@/app/api/apiHandlerBuilder";
import { resetPasswordSchema } from "../schema";
import { getTypedBody } from "../../wrappers/withValidation";

export const POST = new ApiHandlerBuilder()
  .auth()
  .validateBody(resetPasswordSchema)
  .build(async (_: NextRequest, context: Context) => {
    const supabase = context.supabase;

    const { password } = getTypedBody(context, resetPasswordSchema);

    const result = await resetPasswordAction(password, supabase);

    if (result?.error) {
      return badRequest(result.error.code, result.error.message);
    }

    return ok();
  });
