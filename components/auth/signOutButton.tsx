"use client";

import { signOutAction } from "@/components/auth/actions";
import { redirect } from "next/navigation";
import { DebouncedButton } from "../debouncedButton";

export function SignOutButton() {
  async function onClick() {
    await signOutAction();
    redirect("/");
  }

  return <DebouncedButton onDebouncedClick={onClick}>Sign out</DebouncedButton>;
}
