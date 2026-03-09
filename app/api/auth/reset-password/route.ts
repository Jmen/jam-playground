import { resetPasswordCommand } from "../commands";
import { NextRequest } from "next/server";
import { badRequest, ok } from "@/app/api/apiResponse";
import { ApiHandlerBuilder, Context } from "@/app/api/apiHandlerBuilder";
import { resetPasswordSchema } from "../schema";
import { getTypedBody } from "../../wrappers/withValidation";

export const POST = new ApiHandlerBuilder()
  .auth()
  .validateBody(resetPasswordSchema)
  .build(async (_: NextRequest, context: Context) => {
    const { password } = getTypedBody(context, resetPasswordSchema);

    const result = await resetPasswordCommand(password, context.supabase);

    if (result?.error) {
      return badRequest(result.error.code, result.error.message);
    }

    return ok();
  });
