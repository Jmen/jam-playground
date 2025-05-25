"use client";

import { createJamAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirectIfNotLoggedIn } from "@/components/auth/actions";

export default function Page() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createJamAction, null);

  useEffect(() => {
    redirectIfNotLoggedIn().catch(() => {
      router.push("/auth");
    });
  }, [router]);

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create a Jam</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" required />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </form>
          {state?.serverError && <p className="text-red-500 mt-4">{state.serverError.message}</p>}
          {state?.userError && <p className="text-red-500 mt-4">{state.userError.message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
