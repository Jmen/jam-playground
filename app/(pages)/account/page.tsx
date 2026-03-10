import { createClient } from "@/lib/supabase/clients/server";
import { redirect } from "next/navigation";
import { UserDetails } from "@/components/profile/userDetails";
import { ProfileForm } from "@/components/profile/profileForm";
import { GoogleProfile } from "@/components/auth/googleProfile";
import { ResetPasswordForm } from "@/components/auth/resetPasswordForm";
import { getProfileCommand } from "@/app/api/my/profile/commands";
import { isOk } from "@/app/api/result";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/");
  }

  const profileResult = await getProfileCommand(supabase);
  const username = isOk(profileResult) ? profileResult.data.username : "";

  return (
    <div>
      <div className="flex flex-col items-center justify-between gap-6 p-12">
        <UserDetails email={user.email || "Unknown"} />
        <ProfileForm initialUsername={username} />
        <GoogleProfile user={user} />
        <ResetPasswordForm user={user} />
      </div>
    </div>
  );
}
