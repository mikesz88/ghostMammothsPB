"use client";

import { User, LogOut, Settings, Shield } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface HeaderUserMenuProps {
  user: SupabaseUser | null;
  variant: "default" | "admin" | "simple";
  isAdmin: boolean;
  onSignOut: () => void;
}

export function HeaderUserMenu({
  user,
  variant,
  isAdmin,
  onSignOut,
}: HeaderUserMenuProps) {
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
          <User className="w-4 h-4" aria-hidden />
          <span className="max-w-[80px] sm:max-w-[150px] truncate text-xs sm:text-sm">
            {user.user_metadata?.name || user.email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

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
                <Link href="/sitemap" className="cursor-pointer">
                  Sitemap
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/search" className="cursor-pointer">
                  Search
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="https://ghostmammoth.myshopify.com/password"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                  aria-label="Shop (opens in new window)"
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
            <Settings className="w-4 h-4 mr-2" aria-hidden />
            Settings
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <Shield className="w-4 h-4 mr-2" aria-hidden />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" aria-hidden />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
