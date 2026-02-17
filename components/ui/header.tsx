"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { User, LogOut, Settings, ArrowLeft, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface HeaderProps {
  variant?: "default" | "admin" | "simple";
  backButton?: {
    href: string;
    label: string;
  };
  hideNav?: boolean;
  customNav?: React.ReactNode;
}

export const Header = ({
  variant = "default",
  backButton,
  hideNav = false,
  customNav,
}: HeaderProps = {}) => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/about");
  };

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
      <header className="border-b border-border bg-background sticky top-0 z-50">
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

  // Logo component (consistent across all variants)
  const Logo = () => (
    <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
      <Image
        src="/icon-32x32.png"
        alt="Ghost Mammoths PB"
        width={32}
        height={32}
        className="w-6 h-6 sm:w-8 sm:h-8"
      />
      <span className="text-base sm:text-xl font-bold text-foreground truncate max-w-[140px] sm:max-w-none">
        Ghost Mammoths PB
      </span>
    </Link>
  );

  // Default navigation
  const DefaultNav = () => (
    <nav className="flex items-center gap-4">
      <Link
        href="/events"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Events
      </Link>
      <Link
        href="/membership"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Membership
      </Link>
      <Link
        href="/calendar"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Calendar
      </Link>
      <Link
        href="/about"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        About
      </Link>
      <Link
        href="https://ghostmammoth.myshopify.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Shop
      </Link>
    </nav>
  );

  // Admin navigation
  const AdminNav = () => (
    <nav className="flex items-center gap-4">
      <Link
        href="/events"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Events
      </Link>
      <Link href="/admin" className="text-foreground font-medium">
        Dashboard
      </Link>
      <Link
        href="/admin/users"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Users
      </Link>
    </nav>
  );

  // User menu dropdown
  const UserMenu = () => {
    if (!user) {
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 sm:gap-2">
            <User className="w-4 h-4" />
            <span className="max-w-[80px] sm:max-w-[150px] truncate text-xs sm:text-sm">
              {user.user_metadata?.name || user.email}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Mobile Navigation Links - Only show on mobile */}
          <div className="md:hidden">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Navigation
            </DropdownMenuLabel>
            {variant === "admin" ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/events" className="cursor-pointer">
                    Events
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/users" className="cursor-pointer">
                    Users
                  </Link>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/events" className="cursor-pointer">
                    Events
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/membership" className="cursor-pointer">
                    Membership
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/calendar" className="cursor-pointer">
                    Calendar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about" className="cursor-pointer">
                    About
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="https://ghostmammoth.myshopify.com/password"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer"
                  >
                    Shop
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
          </div>

          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <Shield className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        {/* Left side: Logo + optional back button */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Logo />
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

        {/* Right side: Navigation + User menu */}
        {!hideNav && (
          <div className="flex items-center gap-6">
            <div className="hidden md:block">
              {customNav ? (
                customNav
              ) : variant === "admin" ? (
                <AdminNav />
              ) : (
                <DefaultNav />
              )}
            </div>
            <UserMenu />
          </div>
        )}

        {/* Simple variant: just user menu */}
        {hideNav && <UserMenu />}
      </div>
    </header>
  );
};
