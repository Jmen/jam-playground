"use server";

import { ResetPasswordForm } from "@/components/auth/resetPasswordForm";
import { createClient } from "@/lib/supabase/clients/server";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <div className="flex flex-col items-center justify-between gap-6 p-12">
        <ResetPasswordForm user={user} />
      </div>
    </div>
  );
}
