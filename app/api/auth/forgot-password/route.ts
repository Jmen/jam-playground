import { forgotPasswordAction } from "@/components/auth/actions";
import { badRequest, ok } from "../../apiResponse";
import { ApiHandlerBuilder, Context } from "../../apiHandlerBuilder";
import { forgotPasswordSchema } from "../schema";
import { getTypedBody } from "../../wrappers/withValidation";
import { NextRequest } from "next/server";

export const POST = new ApiHandlerBuilder()
  .validateBody(forgotPasswordSchema)
  .build(async (_: NextRequest, context: Context) => {
    const { email } = getTypedBody(context, forgotPasswordSchema);

    const result = await forgotPasswordAction(email);

    if (result?.error) {
      return badRequest(result.error.code, result.error.message);
    }

    return ok();
  });
