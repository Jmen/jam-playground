"use client";

import { useRouter } from "next/navigation";
import { DebouncedButton } from "../debouncedButton";
import { ButtonProps } from "@/components/ui/button";

export function SignOutButton({ variant, size, ...props }: ButtonProps) {
  const router = useRouter();

  async function onClick() {
    await fetch("/api/auth/sign-out", { method: "POST" });
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
