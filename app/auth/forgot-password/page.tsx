import { ForgotPasswordForm } from "@/components/auth/forgotPasswordForm";

export default function Page() {
  return (
    <div>
      <div className="flex flex-col items-center justify-between gap-6 p-12">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
