import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/clients/server";
import { SignOutButton } from "@/components/auth/signOutButton";

export const metadata: Metadata = {
  title: "Infrastructure Template",
  description: "Infrastructure Template",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <nav className="border-b">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
              <Button size="sm" asChild>
                <Link href="/">Home</Link>
              </Button>
              <div className="flex items-center gap-4">
                <Button size="sm" asChild>
                  <Link href={user ? "/account" : "/auth"}>{user ? "My Account" : "Sign in"}</Link>
                </Button>
                {user && <SignOutButton size="sm" />}
              </div>
            </div>
          </nav>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
