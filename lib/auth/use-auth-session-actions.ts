"use client";

import { useMemo } from "react";

import {
  createResendVerificationEmail,
  createResetPasswordForEmail,
  createUpdatePassword,
} from "@/lib/auth/create-auth-password-actions";
import { createAuthSignIn } from "@/lib/auth/create-auth-sign-in";
import { createAuthSignUp } from "@/lib/auth/create-auth-sign-up";

import type { AuthContextType } from "@/lib/auth/auth-context-types";
import type { SupabaseClient } from "@supabase/supabase-js";

export function useAuthSessionActions(supabase: SupabaseClient): Pick<
  AuthContextType,
  | "signIn"
  | "signUp"
  | "signOut"
  | "resendVerificationEmail"
  | "resetPasswordForEmail"
  | "updatePassword"
> {
  return useMemo(
    () => ({
      signIn: createAuthSignIn(supabase),
      signUp: createAuthSignUp(supabase),
      resendVerificationEmail: createResendVerificationEmail(supabase),
      resetPasswordForEmail: createResetPasswordForEmail(supabase),
      updatePassword: createUpdatePassword(supabase),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [supabase],
  );
}
