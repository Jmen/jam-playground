"use server";

import { createClient } from "@/lib/supabase/clients/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";

export async function getJamsAction(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }
  const { data: jams, error } = await supabase
    .from("jams")
    .select("*")
    .eq("deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    jams.map((jam) => ({
      id: jam.human_readable_id,
      name: jam.name,
      description: jam.description,
    })) || []
  );
}

export async function getJamAction(id: string) {
  const supabase = await createClient();

  const { data: jams, error } = await supabase.from("jams").select("*").eq("human_readable_id", id).limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return jams?.length > 0 ? jams[0] : undefined;
}

export async function createJamAction(
  { name, description }: { name: string; description: string },
  supabase?: SupabaseClient,
) {
  if (!supabase) {
    supabase = await createClient();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  if (!name || !description) {
    throw new Error("Name and description are required");
  }

  const humanReadableId: string = uniqueNamesGenerator({
    dictionaries: [adjectives, adjectives, colors, animals],
    separator: "_",
  });

  const { data, error } = await supabase
    .from("jams")
    .insert({
      human_readable_id: humanReadableId,
      name,
      description,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Failed to create jam");
  }

  return { data: { id: data.human_readable_id, name: data.name, description: data.description } };
}
