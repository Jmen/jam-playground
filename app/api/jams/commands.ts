"use server";

import { createClient } from "@/lib/supabase/clients/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";

export async function getJamsCommand(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }
  const { data: jams, error } = await supabase
    .from("jams")
    .select("*")
    .eq("deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      serverError: { code: "internal_server_error", message: "Failed to get jams" },
    };
  }

  return {
    data:
      jams.map((jam) => ({
        id: jam.human_readable_id,
        name: jam.name,
        description: jam.description,
        created_at: jam.created_at,
      })) || [],
  };
}

export async function getJamCommand(id: string) {
  const supabase = await createClient();

  const { data: jams, error } = await supabase.from("jams").select("*").eq("human_readable_id", id).limit(1);

  if (error) {
    return {
      serverError: { code: "internal_server_error", message: "Failed to get jam" },
    };
  }

  if (jams?.length > 0) {
    return {
      data: {
        id: jams[0].human_readable_id,
        name: jams[0].name,
        description: jams[0].description,
        created_at: jams[0].created_at,
      },
    };
  }

  return {
    userError: { code: "not_found", message: "Jam not found" },
  };
}

export async function createJamCommand(
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

  if (!name) {
    return {
      userError: { code: "name_required", message: "Name is required" },
    };
  }

  if (!description) {
    return {
      userError: { code: "description_required", message: "Description is required" },
    };
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

  if (error || !data) {
    return {
      serverError: { code: "internal_server_error", message: "Failed to create jam" },
    };
  }

  return {
    data: { id: data.human_readable_id, name: data.name, description: data.description, created_at: data.created_at },
  };
}
