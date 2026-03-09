import { createClient } from "@/lib/supabase/clients/server";
import { redirect } from "next/navigation";
import { UserDetails } from "@/components/profile/userDetails";
import { ProfileForm } from "@/components/profile/profileForm";
import { GoogleProfile } from "@/components/auth/googleProfile";
import { ResetPasswordForm } from "@/components/auth/resetPasswordForm";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/");
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-between gap-6 p-12">
        <UserDetails />
        <ProfileForm />
        <GoogleProfile user={user} />
        <ResetPasswordForm user={user} />
      </div>
    </div>
  );
}
