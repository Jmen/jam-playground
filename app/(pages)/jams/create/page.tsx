import { createClient } from "@/lib/supabase/clients/server";
import { redirect } from "next/navigation";
import { CreateJamForm } from "@/components/jams/createJamForm";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth");
  }

  return <CreateJamForm />;
}
