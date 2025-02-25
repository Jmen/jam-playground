"use server";

import { createClient } from "@/lib/supabase/clients/server";
import { redirectIfNotLoggedIn } from "@/components/auth/actions";
import { UserDetails } from "@/components/profile/userDetails";
import { ProfileForm } from "@/components/profile/profileForm";
import { GoogleProfile } from "@/components/auth/googleProfile";
import { ResetPasswordForm } from "@/components/auth/resetPasswordForm";
import { SignOutButton } from "@/components/auth/signOutButton";

export default async function Page() {
  await redirectIfNotLoggedIn();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <div className="flex flex-col items-center justify-between gap-6 p-12">
        <UserDetails />
        <ProfileForm />
        <GoogleProfile user={user} />
        <ResetPasswordForm user={user} />
        <SignOutButton />
      </div>
    </div>
  );
}
