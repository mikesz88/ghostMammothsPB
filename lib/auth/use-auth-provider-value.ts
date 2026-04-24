"use client";

import { useMemo } from "react";

import { useAuthSessionActions } from "@/lib/auth/use-auth-session-actions";
import { useAuthSessionState } from "@/lib/auth/use-auth-session-state";

import type { AuthContextType } from "@/lib/auth/auth-context-types";
import type { SupabaseClient } from "@supabase/supabase-js";

export function useAuthProviderValue(
  supabase: SupabaseClient,
): AuthContextType {
  const { user, session, loading } = useAuthSessionState(supabase);
  const actions = useAuthSessionActions(supabase);
  return useMemo(
    () => ({
      user,
      session,
      loading,
      ...actions,
    }),
    [user, session, loading, actions],
  );
}
