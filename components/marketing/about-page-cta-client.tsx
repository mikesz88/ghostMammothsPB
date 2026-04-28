"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

import type { HeaderServerSnapshot } from "@/components/ui/header/header-client";

type AboutPageCtaClientProps = {
  serverSnapshot?: HeaderServerSnapshot | null;
};

export function AboutPageCtaClient({
  serverSnapshot,
}: AboutPageCtaClientProps) {
  const { user } = useAuth();
  const [clientAdmin, setClientAdmin] = useState<{
    userId: string;
    value: boolean;
  } | null>(null);

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
    <>
      <h2 className="text-3xl font-bold text-foreground mb-4">
        Ready to Play?
      </h2>
      <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
        Join our community and experience hassle-free pickleball queue
        management
      </p>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Button size="lg" asChild>
          <Link href="/events">Browse Events</Link>
        </Button>
        {isAdmin && (
          <Button size="lg" variant="outline" asChild>
            <Link href="/admin">Event Organizers</Link>
          </Button>
        )}
      </div>
    </>
  );
}
