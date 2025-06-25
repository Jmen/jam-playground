import { NextRequest } from "next/server";
import { ApiHandlerBuilder, Context } from "../../apiHandlerBuilder";
import { createResponse } from "@/app/api/result";
import { getJamCommand } from "./commands";

export const GET = new ApiHandlerBuilder()
  .auth()
  .build(async (req: NextRequest, context: Context) => {
    const supabase = context.supabase;

    const id = req.nextUrl.pathname.split("/")[3];

    const result = await getJamCommand(id, supabase);

    return createResponse(result, {}, "get jam");
  });
