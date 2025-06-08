"use server";

import { getJamCommand } from "@/app/api/jams/commands";
import { redirectIfNotLoggedIn } from "@/components/auth/actions";
import { createClient } from "@/lib/supabase/clients/server";
import { ErrorCode, Result } from "@/app/api/result";

export async function getJamData(id: string): Promise<Result<{
  id: string;
  name: string;
  description: string;
  created_at: string;
  loops?: { audioId: string }[];
}>> {
  await redirectIfNotLoggedIn();
  
  return await getJamCommand(id);
}

export async function getAudioFiles(): Promise<Result<Array<{
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
}>>> {
  await redirectIfNotLoggedIn();
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("audio_files")
    .select("id, file_name, file_type, created_at")
    .order("created_at", { ascending: false });
  
  if (error) {
    return {
      error: {
        code: "database_error",
        message: "Failed to fetch audio files",
        type: ErrorCode.SERVER_ERROR
      }
    };
  }
  
  return { data };
}

export async function addLoopToJam(jamId: string, audioId: string): Promise<Result<{
  id: string;
  name: string;
  description: string;
  created_at: string;
  loops?: { audioId: string }[];
}>> {
  await redirectIfNotLoggedIn();
  
  const supabase = await createClient();
  
  const { data: jam, error: jamError } = await supabase
    .from("jams")
    .select("id")
    .eq("human_readable_id", jamId)
    .single();
  
  if (jamError || !jam) {
    return {
      error: {
        code: "not_found",
        message: "Jam not found or access denied",
        type: ErrorCode.CLIENT_ERROR
      }
    };
  }
  
  const { data: loops, error: loopsError } = await supabase
    .from("jam_loops")
    .select("position")
    .eq("jam_id", jam.id)
    .order("position", { ascending: false });
  
  if (loopsError) {
    return {
      error: {
        code: "database_error",
        message: "Failed to get loop positions",
        type: ErrorCode.SERVER_ERROR
      }
    };
  }
  
  const position = loops && loops.length > 0 ? loops[0].position + 1 : 0;
  
  const { error: insertError } = await supabase
    .from("jam_loops")
    .insert({
      jam_id: jam.id,
      audio_id: audioId,
      position,
    });
  
  if (insertError) {
    return {
      error: {
        code: "database_error",
        message: "Failed to add loop",
        type: ErrorCode.SERVER_ERROR
      }
    };
  }
  
  return await getJamCommand(jamId);
}
