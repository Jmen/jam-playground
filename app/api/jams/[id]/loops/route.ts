import { NextRequest } from "next/server";
import { ApiHandlerBuilder, Context } from "../../../apiHandlerBuilder";
import { createResponse } from "@/app/api/result";
import { addLoopToJamCommand } from "./commands";
import { getTypedBody } from "../../../wrappers/withValidation";
import { addLoopSchema } from "./schema";

export const POST = new ApiHandlerBuilder()
  .auth()
  .validateBody(addLoopSchema)
  .build(async (req: NextRequest, context: Context) => {
    const supabase = context.supabase;

    const id = req.nextUrl.pathname.split("/")[3];

    const body = getTypedBody(context, addLoopSchema);

    const result = await addLoopToJamCommand(id, body, supabase);

    return createResponse(result, body, "add loop to jam");
  });
