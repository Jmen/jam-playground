"use client";

import { Button } from "@/components/ui/button";
import { signInWithGoogleAction } from "@/components/auth/actions";
import { useState } from "react";
import { GoogleIcon } from "@/components/icons/google";

interface GoogleSignInProps {
  onError?: (error: string) => void;
}

export function GoogleSignIn({ onError }: GoogleSignInProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      const result = await signInWithGoogleAction();
      if (result?.error && onError) {
        onError(result.error);
        setIsLoading(false);
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch {
      setIsLoading(false);
      onError?.("Failed to initialize Google sign-in");
    }
  }

  return (
    <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
      <GoogleIcon />
      {isLoading ? "Connecting..." : "Google"}
    </Button>
  );
}
