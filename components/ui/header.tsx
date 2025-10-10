"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { User, LogOut, Settings } from "lucide-react";

export const Header = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const supabase = createClient();
        const { data } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        setIsAdmin(data?.is_admin || false);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  if (loading) {
    return (
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/icon-32x32.png"
              alt="Ghost Mammoths PB"
              width={32}
              height={32}
            />
            <span className="text-xl font-bold text-foreground">
              Ghost Mammoths PB
            </span>
          </div>
          <div className="w-32 h-8 bg-muted animate-pulse rounded" />
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/icon-32x32.png"
            alt="Ghost Mammoths PB"
            width={32}
            height={32}
          />
          <span className="text-xl font-bold text-foreground">
            Ghost Mammoths PB
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/events"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Events
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings/notifications">
                  <Settings className="w-4 h-4 mr-1" />
                  Settings
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user.user_metadata?.name || user.email}</span>
              </div>
              <form action={signOut}>
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
