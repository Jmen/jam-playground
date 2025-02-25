"use client";

import { User } from "@supabase/supabase-js";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface UserMetadata {
  avatar_url?: string;
  picture?: string;
  full_name?: string;
  name?: string;
}

interface Props {
  user: User | null;
}

export function GoogleProfile({ user }: Props) {
  if (!user) {
    return null;
  }

  const metadata = user.user_metadata as UserMetadata;
  const avatarUrl = metadata.avatar_url || metadata.picture;
  const name = metadata.full_name || metadata.name;
  const isGoogleUser = user.app_metadata.providers?.includes("google");

  if (!isGoogleUser || !avatarUrl) {
    return null;
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Google Account</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Image src={avatarUrl} alt="Profile" width={48} height={48} className="rounded-full" />
          <p className="font-medium">{name}</p>
        </div>
      </CardContent>
    </Card>
  );
}
