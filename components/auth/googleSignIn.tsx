"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/clients/client";
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
      const supabase = createClient();
      const origin = window.location.origin;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/api/auth/callback?next=/account`,
          queryParams: {
            prompt: "select_account",
            access_type: "offline",
          },
        },
      });

      if (error) {
        onError?.(error.message);
        setIsLoading(false);
      } else if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      setIsLoading(false);
      onError?.("Failed to initialize Google sign-in");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      <GoogleIcon />
      {isLoading ? "Connecting..." : "Google"}
    </Button>
  );
}
