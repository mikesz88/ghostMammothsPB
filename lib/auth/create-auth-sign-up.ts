"use client";

import { runAuthSignUpFlow } from "@/lib/auth/run-auth-sign-up-flow";

import type { AuthFlowError } from "@/lib/auth/auth-flow-types";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createAuthSignUp(supabase: SupabaseClient) {
  return async (
    email: string,
    password: string,
    userData: { name: string; skillLevel: string; phone?: string },
  ): Promise<{ error: AuthFlowError }> =>
    runAuthSignUpFlow(supabase, email, password, userData);
}
