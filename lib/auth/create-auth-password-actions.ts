"use client";

import { getAppBaseUrlOrNull } from "@/lib/auth/get-app-base-url";

import type { AuthFlowError } from "@/lib/auth/auth-flow-types";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createResendVerificationEmail(supabase: SupabaseClient) {
  return async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    return { error };
  };
}

export function createResetPasswordForEmail(supabase: SupabaseClient) {
  return async (email: string): Promise<{ error: AuthFlowError }> => {
    const baseUrl = getAppBaseUrlOrNull();
    if (!baseUrl) {
      return {
        error: new Error(
          "Configuration error: Unable to determine application URL",
        ),
      };
    }
    const redirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent("/reset-password")}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return { error };
  };
}

export function createUpdatePassword(supabase: SupabaseClient) {
  return async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };
}
