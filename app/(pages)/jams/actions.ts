"use server";

import { createJamCommand } from "@/app/api/jams/commands";
import { createClient } from "@/lib/supabase/clients/server";
import { redirect } from "next/navigation";

export async function createJamAction(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name || !description) {
    throw new Error("Name and description are required");
  }

  const result = await createJamCommand({ name, description }, supabase);

  if (result.serverError || result.userError) {
    return result;
  }

  if (result.data) {
    redirect(`/jams/${result.data.id}`);
  }
}
