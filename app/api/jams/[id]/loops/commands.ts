"use server";

import { createClient } from "@/lib/supabase/clients/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { ErrorCode, Result } from "../../../result";
import { insertLoop } from "./db";

export interface Loop {
  audio: {
    id: string;
  }[];
}

export async function addLoopToJamCommand(
  jamId: string,
  loop: Loop,
  supabase?: SupabaseClient,
): Promise<Result<Loop>> {
  if (!supabase) {
    supabase = await createClient();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: {
        code: "unauthorized",
        message: "User not authenticated",
        type: ErrorCode.CLIENT_ERROR,
      },
    };
  }

  return await insertLoop(supabase, jamId, user.id, loop);
}
