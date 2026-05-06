"use client";

import { ResetPasswordActiveCard } from "@/components/auth/reset-password/reset-password-active-card";
import { ResetPasswordLoadingState } from "@/components/auth/reset-password/reset-password-loading-state";
import { ResetPasswordNoUserCard } from "@/components/auth/reset-password/reset-password-no-user-card";
import { useAuth } from "@/lib/auth/auth-context";

export function ResetPasswordPageClient() {
  const { user, loading: authLoading, updatePassword, signOut } = useAuth();

  if (authLoading) {
    return <ResetPasswordLoadingState />;
  }

  if (!user) {
    return <ResetPasswordNoUserCard />;
  }

  return (
    <ResetPasswordActiveCard updatePassword={updatePassword} signOut={signOut} />
  );
}
