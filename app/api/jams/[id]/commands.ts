import { createClient } from "@/lib/supabase/clients/server";
import { ErrorCode, isError, Result } from "@/app/api/result";
import { getJam, updateJamAccess } from "./db";
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

export async function updateJamCommand(
  id: string,
  { public: isPublic }: { public: boolean },
  supabase: SupabaseClient,
): Promise<Result<object>> {
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

  const access = isPublic ? "public" : "private";

  const result = await updateJamAccess(supabase, id, access, user.id);

  return result;
}
