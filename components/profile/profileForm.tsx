"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DebouncedButton } from "../debouncedButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfileAction, updateProfileAction } from "./actions";
import { logger } from "@/lib/logger";

const schema = z.object({
  username: z
    .string()
    .min(3, { message: "username must be at least 3 characters" })
    .max(32, { message: "username must be less than 32 characters" }),
});

export function ProfileForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("Loading...");

  useEffect(() => {
    getProfileAction().then((result) => {
      if (result.error) {
        logger.error("Failed to load profile", { error: result.error });
        setError(result.error.message);
        return;
      }
      setUsername(result.data.username || "");
      setIsLoading(false);
    });
  }, []);

  async function onSubmit() {
    const parsed = schema.safeParse({ username });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    const result = await updateProfileAction(username);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setError(null);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
    }, 2000);
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} />
          </div>
          <div className="flex items-center gap-4">
            <DebouncedButton type="submit" onDebouncedClick={onSubmit}>
              Update Profile
            </DebouncedButton>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">Profile updated</p>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
