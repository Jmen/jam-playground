import { NextRequest } from "next/server";
import { createJamCommand, getJamsCommand } from "./commands";
import { ApiHandlerBuilder, Context } from "../apiHandlerBuilder";
import { getTypedBody } from "../wrappers/withValidation";
import { createJamSchema } from "./schema";
import { createResponse } from "@/app/api/result";

export const GET = new ApiHandlerBuilder()
  .auth()
  .build(async (_: NextRequest, context: Context) => {
    const supabase = context.supabase;

    const result = await getJamsCommand(supabase);

    return createResponse(result, {}, "get jams");
  });

export const POST = new ApiHandlerBuilder()
  .auth()
  .validateBody(createJamSchema)
  .build(async (_: NextRequest, context: Context) => {
    const supabase = context.supabase;

    const body = getTypedBody(context, createJamSchema);

    const result = await createJamCommand(body, supabase);

    return createResponse(result, body, "create jam");
  });
