import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/clients/server";
import { NavigationBar } from "@/components/layout/NavigationBar";

export const metadata: Metadata = {
  title: "Jam Playground",
  description: "Jam Playground",
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
          <NavigationBar user={user} />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
