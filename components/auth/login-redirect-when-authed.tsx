"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { User } from "@supabase/supabase-js";

type Props = {
  user: User | null;
  authLoading: boolean;
};

export function LoginRedirectWhenAuthed({ user, authLoading }: Props) {
  const router = useRouter();
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/membership");
    }
  }, [authLoading, user, router]);
  return null;
}
