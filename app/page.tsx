import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/clients/server";
import { UserDetails } from "@/components/profile/userDetails";
import { AuthOptions } from "@/components/auth/authOptions";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect("/account");
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-between gap-6 p-12">
        <UserDetails />
        <AuthOptions />
      </div>
    </div>
  );
}
