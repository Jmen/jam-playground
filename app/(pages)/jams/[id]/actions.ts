"use server";

import { updateJamCommand } from "@/app/api/jams/[id]/commands";
import { createClient } from "@/lib/supabase/clients/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isError } from "@/app/api/result";

export async function makeJamPublicAction(jamId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const result = await updateJamCommand(jamId, { public: true }, supabase);

  if (isError(result)) {
    return result;
  }

  revalidatePath("/", "layout");

  redirect(`/jams/${jamId}`);
}
