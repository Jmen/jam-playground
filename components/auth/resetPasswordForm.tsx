"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DebouncedButton } from "../debouncedButton";
import { resetPasswordAction } from "@/components/auth/actions";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";

const formSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "password must be at least 6 characters" })
      .max(256, { message: "password must be less than 256 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwords don't match",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm({ user }: { user: User | null }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const { password, confirmPassword } = form.watch();
  const passwordsMatch = password === confirmPassword && password !== "";

  const isEmailUser = user?.app_metadata?.providers?.includes("email");

  if (!isEmailUser) {
    return null;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    const result = await resetPasswordAction(values.password);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setError(null);
    setSuccess(true);

    setTimeout(() => {
      router.push("/");
    }, 2000);
  }

  if (success) {
    return (
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-green-600">Your password has been successfully reset.</p>
            <p className="text-sm text-muted-foreground mt-2">Redirecting you to sign in...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DebouncedButton type="submit" onDebouncedClick={form.handleSubmit(onSubmit)} disabled={!passwordsMatch}>
              Reset Password
            </DebouncedButton>
          </form>
          {error && <p className="text-red-500 pt-6">{error}</p>}
        </Form>
      </CardContent>
    </Card>
  );
}
