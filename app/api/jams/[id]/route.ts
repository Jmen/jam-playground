import { NextRequest } from "next/server";
import { ApiHandlerBuilder, Context } from "../../apiHandlerBuilder";
import { createResponse } from "@/app/api/apiResponse";
import { getJamCommand, updateJamCommand } from "./commands";
import { updateJamSchema } from "./schema";
import { getTypedBody } from "../../wrappers/withValidation";

export const GET = new ApiHandlerBuilder()
  .auth()
  .build(async (req: NextRequest, context: Context) => {
    const supabase = context.supabase;

    const id = req.nextUrl.pathname.split("/")[3];

    const result = await getJamCommand(id, supabase);

    return createResponse(result, {}, "get jam");
  });

export const PUT = new ApiHandlerBuilder()
  .auth()
  .validateBody(updateJamSchema)
  .build(async (req: NextRequest, context: Context) => {
    const supabase = context.supabase;

    const id = req.nextUrl.pathname.split("/")[3];
    const body = getTypedBody(context, updateJamSchema);

    const result = await updateJamCommand(id, body, supabase);

    return createResponse(result, {}, "update jam");
  });
