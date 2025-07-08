import { NextRequest } from "next/server";
import { ApiHandlerBuilder, Context } from "../apiHandlerBuilder";
import { getAudioCommand, uploadAudioCommand } from "./commands";
import { badRequest, createResponse } from "@/app/api/apiResponse";


export const POST = new ApiHandlerBuilder()
  .auth()
  .build(async (req: NextRequest, context: Context) => {
    const supabase = context.supabase;

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return badRequest("No file provided");
    }

    const result = await uploadAudioCommand(
      {
        file,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      },
      supabase,
    );

    return createResponse(result, {}, "upload audio");
  });

export const GET = new ApiHandlerBuilder()
  .auth()
  .build(async (req: NextRequest, context: Context) => {
    const supabase = context.supabase;

    const result = await getAudioCommand(supabase);

    return createResponse(result, {}, "get audio files");
  });
