import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/signOutButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";
import { ChevronDown } from "lucide-react";

interface NavigationBarProps {
  user: User | null;
}

// Component for non-authenticated users
function GuestNavigation() {
  return (
    <div className="flex items-center gap-4">
      <Button size="sm" variant="ghost" asChild>
        <Link href="/docs">API docs</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/auth">Sign in</Link>
      </Button>
    </div>
  );
}

// Component for authenticated users with dropdown menu
function UserNavigation() {
  return (
    <div className="flex items-center gap-4">
      <Button size="sm" variant="ghost" asChild>
        <Link href="/docs">API docs</Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
          >
            Account
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px] p-2">
          <DropdownMenuItem asChild className="px-3 py-2 cursor-pointer">
            <Link href="/account" className="w-full">
              My Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="px-3 py-2 cursor-pointer">
            <SignOutButton
              size="sm"
              className="w-full justify-start p-0 h-auto font-normal"
              variant="ghost"
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Main NavigationBar component that conditionally renders the appropriate navigation
export function NavigationBar({ user }: NavigationBarProps) {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center">
        <div className="flex-1">
          <Button size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-bold">Jam Playground</h1>
        </div>
        <div className="flex-1 flex justify-end">
          {user ? <UserNavigation /> : <GuestNavigation />}
        </div>
      </div>
    </nav>
  );
}
