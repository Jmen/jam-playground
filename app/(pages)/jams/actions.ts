"use server";

import { createClient } from "@/lib/supabase/clients/server";
import { redirect } from "next/navigation";

export async function getJamsAction() {
  const supabase = await createClient();
  
  const { data: jams, error } = await supabase
    .from("jams")
    .select("*")
    .eq("deleted", false)
    .order("created_at", { ascending: false });
    
  if (error) {
    throw new Error(error.message);
  }
  
  return jams || [];
}

export async function createJamAction(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth");
  }
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  if (!name || !description) {
    throw new Error("Name and description are required");
  }
  
  const { error } = await supabase
    .from("jams")
    .insert({
      name,
      description,
      owner_id: user.id,
    });
  
  if (error) {
    throw new Error(error.message);
  }
  
  redirect("/");
}
