import { forgotPasswordCommand } from "../commands";
import { badRequest, ok } from "../../apiResponse";
import { ApiHandlerBuilder, Context } from "../../apiHandlerBuilder";
import { forgotPasswordSchema } from "../schema";
import { getTypedBody } from "../../wrappers/withValidation";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/clients/server";

export const POST = new ApiHandlerBuilder()
  .validateBody(forgotPasswordSchema)
  .build(async (req: NextRequest, context: Context) => {
    const { email } = getTypedBody(context, forgotPasswordSchema);

    const origin =
      req.headers.get("origin")?.replace("127.0.0.1", "localhost") || "";
    const supabase = await createClient();
    const result = await forgotPasswordCommand(email, origin, supabase);

    if (result?.error) {
      return badRequest(result.error.code, result.error.message);
    }

    return ok();
  });
