"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DebouncedButton } from "../debouncedButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "please enter a valid email address" })
    .max(256, { message: "email must be less than 256 characters" }),
});

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: values.email }),
    });

    if (!response.ok) {
      const result = await response.json();
      setError(result.error?.message ?? "Failed to send reset link");
      return;
    }

    setError(null);
    setSuccess(true);
  }

  if (success) {
    return (
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-green-600">
              If an account exists for this email, you will receive password
              reset instructions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DebouncedButton
              type="submit"
              onDebouncedClick={form.handleSubmit(onSubmit)}
            >
              Send Reset Link
            </DebouncedButton>
          </form>
          {error && <p className="text-red-500 pt-6">{error}</p>}
        </Form>
      </CardContent>
    </Card>
  );
}
