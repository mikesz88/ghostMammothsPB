"use client";

import type { AuthError } from "@supabase/supabase-js";

type AuthFlowError = AuthError | Error | null;

type SignInFn = (
  email: string,
  password: string,
) => Promise<{ error: AuthFlowError }>;

export async function submitLoginCredentials(
  email: string,
  password: string,
  signIn: SignInFn,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await signIn(email, password);
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
