"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/clients/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UserDetails() {
  const [email, setEmail] = useState<string | undefined>("Loading...");

  useEffect(() => {
    const client = createClient();

    client.auth.getUser().then((user) => {
      const email = user?.data?.user?.email;

      if (email) {
        setEmail(email);
      } else {
        setEmail("Not logged in");
      }
    });
  });

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        <p>email: {email}</p>
      </CardContent>
    </Card>
  );
}
