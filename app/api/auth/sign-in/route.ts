import { signInAction } from "@/components/auth/actions";
import { ok, badRequest, internalServerError } from "../../apiResponse";
import { logger } from "@/lib/logger";
import { ApiHandlerBuilder, Context } from "../../apiHandlerBuilder";
import { signInSchema } from "../schema";
import { getTypedBody } from "../../wrappers/withValidation";
import { NextRequest } from "next/server";

export const POST = new ApiHandlerBuilder()
  .validateBody(signInSchema)
  .build(async (_: NextRequest, context: Context) => {
    const { email, password } = getTypedBody(context, signInSchema);

    const result = await signInAction(email, password);

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
