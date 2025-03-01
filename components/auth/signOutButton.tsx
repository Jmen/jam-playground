"use client";

import { signOutAction } from "@/components/auth/actions";
import { redirect } from "next/navigation";
import { DebouncedButton } from "../debouncedButton";
import { ButtonProps } from "@/components/ui/button";

export function SignOutButton({ variant, size, ...props }: ButtonProps) {
  async function onClick() {
    await signOutAction();
    redirect("/");
  }

  return (
    <DebouncedButton onDebouncedClick={onClick} variant={variant} size={size} {...props}>
      Sign out
    </DebouncedButton>
  );
}
