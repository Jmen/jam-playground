"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { ErrorCode, isError, Result } from "@/app/api/result";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/clients/server";
import { insertAudio, getAudio } from "./db";
import { uploadAudio } from "./storage";

export interface AudioFile {
  id: string;
  owner_id: string;
  created_at: string;
  file_hash: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export async function uploadAudioCommand(
  {
    file,
    fileName,
    fileType,
    fileSize,
  }: { file: File; fileName: string; fileType: string; fileSize: number },
  supabase?: SupabaseClient,
): Promise<Result<AudioFile>> {
  const supabaseClient = supabase || (await createClient());

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    return {
      error: {
        code: "unauthorized",
        message: "User not authenticated",
        type: ErrorCode.CLIENT_ERROR,
      },
    };
  }

  const buffer = await file.arrayBuffer();
  const hash = crypto
    .createHash("sha256")
    .update(Buffer.from(buffer))
    .digest("hex");

  const fileExt = fileName.split(".").pop();
  const filePath = `${hash}.${fileExt}`;

  const uploadResult = await uploadAudio(supabaseClient, filePath, file);

  if (isError(uploadResult)) {
    return uploadResult;
  }

  return await insertAudio(
    supabaseClient,
    user,
    hash,
    filePath,
    fileName,
    fileSize,
    fileType,
  );
}

export async function getAudioFilesCommand(
  supabase?: SupabaseClient,
): Promise<Result<AudioFile[]>> {
  const supabaseClient = supabase || (await createClient());

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    return {
      error: {
        code: "unauthorized",
        message: "User not authenticated",
        type: ErrorCode.CLIENT_ERROR,
      },
    };
  }

  return getAudio(supabaseClient, user);
}
