import { NextRequest } from "next/server";
import { ApiHandlerBuilder, Context } from "@/app/api/apiHandlerBuilder";
import {
  getProfileCommand,
  updateProfileCommand,
} from "@/app/api/my/profile/commands";
import { createResponse } from "../../result";
import { updateProfileSchema } from "./schema";
import { getTypedBody } from "../../wrappers/withValidation";

export const GET = new ApiHandlerBuilder()
  .auth()
  .build(async (_request: NextRequest, context?: Context) => {
    const supabase = context?.supabase;

    const result = await getProfileCommand(supabase);

    return createResponse(result, {}, "get profile");
  });

export const POST = new ApiHandlerBuilder()
  .auth()
  .validateBody(updateProfileSchema)
  .build(async (_: NextRequest, context: Context) => {
    const supabase = context.supabase;

    const { username } = getTypedBody(context, updateProfileSchema);

    const result = await updateProfileCommand(username, supabase);

    return createResponse(result, { username }, "update profile");
  });
