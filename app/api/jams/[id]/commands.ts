"use server";

import { createClient } from "@/lib/supabase/clients/server";
import { isError, Result } from "@/app/api/result";
import { getJam } from "./db";
import { SupabaseClient } from "@supabase/supabase-js";
import { JamView } from "./domain";
import { getSignedUrls } from "./audioUrl";

export async function getJamCommand(
  id: string,
  supabase?: SupabaseClient,
): Promise<Result<JamView>> {
  if (!supabase) {
    supabase = await createClient();
  }

  const result = await getJam(supabase, id);

  if (isError(result)) {
    return result;
  }

  const jam = result.data;

  const urls = await getSignedUrls(supabase, jam.audio());

  if (isError(urls)) {
    return urls;
  }

  return jam.viewWithAudioUrls(urls.data);
}
