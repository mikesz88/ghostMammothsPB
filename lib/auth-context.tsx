"use client";

import { createContext, useContext, useMemo } from "react";

import { useAuthProviderValue } from "@/lib/auth/use-auth-provider-value";
import { createClient } from "@/lib/supabase/client";

import type { AuthContextType } from "@/lib/auth/auth-context-types";

export type { AuthContextType } from "@/lib/auth/auth-context-types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const value = useAuthProviderValue(supabase);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
