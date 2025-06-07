import { signUpAction } from "@/components/auth/actions";
import { badRequest, internalServerError, ok } from "../../apiResponse";
import { logger } from "@/lib/logger";
import { ApiHandlerBuilder, Context } from "../../apiHandlerBuilder";
import { registerSchema } from "../schema";
import { getTypedBody } from "../../wrappers/withValidation";
import { NextRequest } from "next/server";

export const POST = new ApiHandlerBuilder()
  .validateBody(registerSchema)
  .build(async (_: NextRequest, context: Context) => {
    const { email, password } = getTypedBody(context, registerSchema);

    const result = await signUpAction(email, password);

    if (result?.error) {
      return badRequest(result.error.code, result.error.message);
    }

    if (!result.session?.access_token || !result.session?.refresh_token) {
      logger.error({ result, email }, "Failed to create session");
      return internalServerError();
    }

    return ok({
      accessToken: result.session.access_token,
      refreshToken: result.session.refresh_token,
    });
  });
