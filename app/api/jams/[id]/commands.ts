"use server";

import { createClient } from "@/lib/supabase/clients/server";
import { Result } from "@/app/api/result";
import { getJam } from "./db";
import { SupabaseClient } from "@supabase/supabase-js";

interface Jam {
  id: string;
  name: string;
  description: string;
  created_at: string;
  loops: {
    audio: {
      id: string;
    }[];
  }[];
}

export async function getJamCommand(
  id: string,
  supabase?: SupabaseClient,
): Promise<Result<Jam>> {
  if (!supabase) {
    supabase = await createClient();
  }

  return await getJam(supabase, id);
}
