"use client";

import { useRouter } from "next/navigation";
import { DebouncedButton } from "../debouncedButton";
import { ButtonProps } from "@/components/ui/button";
import { api } from "@/lib/api/client";

export function SignOutButton({ variant, size, ...props }: ButtonProps) {
  const router = useRouter();

  async function onClick() {
    await api.auth.signOut();
    router.push("/");
  }

  return (
    <DebouncedButton
      onDebouncedClick={onClick}
      variant={variant}
      size={size}
      {...props}
    >
      Sign out
    </DebouncedButton>
  );
}
