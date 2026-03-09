import { signOutCommand } from "../commands";
import { ok, badRequest } from "../../apiResponse";
import { NextRequest } from "next/server";
import { ApiHandlerBuilder, Context } from "../../apiHandlerBuilder";

export const POST = new ApiHandlerBuilder()
  .auth()
  .build(async (_: NextRequest, context: Context) => {
    const result = await signOutCommand(context.supabase);

    if (result?.error) {
      return badRequest(result.error.code, result.error.message);
    }

    return ok({ success: true });
  });
