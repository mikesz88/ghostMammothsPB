"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { HeaderUserMenu } from "@/components/ui/header/header-user-menu";
import { HeaderLogo } from "@/components/ui/header/parts/header-logo";
import { HeaderAdminNav } from "@/components/ui/header/parts/header-nav-admin";
import { HeaderDefaultNav } from "@/components/ui/header/parts/header-nav-default";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

export type HeaderServerSnapshot = {
  userId: string;
  isAdmin: boolean;
};

export interface HeaderProps {
  variant?: "default" | "admin" | "simple";
  backButton?: {
    href: string;
    label: string;
  };
  hideNav?: boolean;
  customNav?: ReactNode;
  /** When set from `SiteHeader`, desktop nav is rendered on the server and passed in. */
  children?: ReactNode;
  /** From `SiteHeader`: session-bound admin flag; avoids extra round-trip when it matches `useAuth` user. */
  serverSnapshot?: HeaderServerSnapshot | null;
}

export function Header({
  variant = "default",
  backButton,
  hideNav = false,
  customNav,
  children: navFromServer,
  serverSnapshot,
}: HeaderProps = {}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [clientAdmin, setClientAdmin] = useState<{
    userId: string;
    value: boolean;
  } | null>(null);

  const handleSignOut = async () => {
    await signOut();
    router.push("/about");
  };

  useEffect(() => {
    if (!user) return;
    if (serverSnapshot && user.id === serverSnapshot.userId) return;
    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (!cancelled)
        setClientAdmin({
          userId: user.id,
          value: data?.is_admin ?? false,
        });
    })();
    return () => {
      cancelled = true;
    };
  }, [user, serverSnapshot]);

  const isAdmin =
    user == null
      ? false
      : serverSnapshot?.userId === user.id
        ? serverSnapshot.isAdmin
        : clientAdmin?.userId === user.id
          ? clientAdmin.value
          : false;

  if (loading) {
    return (
      <header className="border-b border-border bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/icon-32x32.png"
              alt="Ghost Mammoth PB"
              width={32}
              height={32}
            />
            <span className="text-xl font-bold text-foreground">
              Ghost Mammoth PB
            </span>
          </div>
          <div className="w-32 h-8 bg-muted animate-pulse rounded" />
        </div>
      </header>
    );
  }

  const desktopNav =
    customNav ??
    navFromServer ??
    (variant === "admin" ? <HeaderAdminNav /> : <HeaderDefaultNav />);

  return (
    <header className="border-b border-border bg-white dark:bg-zinc-900 sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <HeaderLogo />
          {backButton && (
            <>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden sm:flex"
              >
                <Link href={backButton.href}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {backButton.label}
                </Link>
              </Button>
            </>
          )}
        </div>

        {!hideNav && (
          <div className="flex items-center gap-6">
            <div className="hidden md:block">{desktopNav}</div>
            <HeaderUserMenu
              user={user}
              variant={variant}
              isAdmin={isAdmin}
              onSignOut={handleSignOut}
            />
          </div>
        )}

        {hideNav && (
          <HeaderUserMenu
            user={user}
            variant={variant}
            isAdmin={isAdmin}
            onSignOut={handleSignOut}
          />
        )}
      </div>
    </header>
  );
}
