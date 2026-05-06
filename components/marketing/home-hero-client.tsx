"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

import type { HeaderServerSnapshot } from "@/components/ui/header/header-client";

type HomeHeroClientProps = {
  /** From server `searchParams` when middleware sends `?error=admin-access-required`. */
  initialAdminAccessDenied: boolean;
  /** Optional: avoids extra `is_admin` fetch on first paint when session matches. */
  serverSnapshot?: HeaderServerSnapshot | null;
};

export function HomeHeroClient({
  initialAdminAccessDenied,
  serverSnapshot,
}: HomeHeroClientProps) {
  const { user } = useAuth();
  const [showAdminError, setShowAdminError] = useState(initialAdminAccessDenied);
  const [clientAdmin, setClientAdmin] = useState<{
    userId: string;
    value: boolean;
  } | null>(null);

  useEffect(() => {
    if (!showAdminError) return;
    const t = window.setTimeout(() => setShowAdminError(false), 5000);
    return () => window.clearTimeout(t);
  }, [showAdminError]);

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

  let isAdmin = false;
  if (user) {
    if (serverSnapshot?.userId === user.id) {
      isAdmin = serverSnapshot.isAdmin;
    } else if (clientAdmin?.userId === user.id) {
      isAdmin = clientAdmin.value;
    }
  }

  return (
    <section className="container mx-auto px-4 py-20 text-center">
      {showAdminError && (
        <div className="max-w-2xl mx-auto mb-6">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Admin access required. You don&apos;t have permission to access
              the admin dashboard.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">
        Smart Queue Management for Pickleball Events
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
        Join the queue, track your position, and get notified when it&apos;s
        your turn to play. Real-time court assignments and seamless rotation
        management.
      </p>
      <div className="flex items-center justify-center gap-4">
        {user ? (
          <>
            <Button size="lg" asChild>
              <Link href="/events">View Events</Link>
            </Button>
            {isAdmin && (
              <Button size="lg" variant="outline" asChild>
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
            )}
          </>
        ) : (
          <>
            <Button size="lg" asChild>
              <Link href="/signup">Sign Up to Join Events</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
