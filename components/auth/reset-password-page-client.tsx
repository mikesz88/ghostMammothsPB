"use client";

import { ResetPasswordActiveCard } from "@/components/auth/reset-password-active-card";
import { ResetPasswordLoadingState } from "@/components/auth/reset-password-loading-state";
import { ResetPasswordNoUserCard } from "@/components/auth/reset-password-no-user-card";
import { useAuth } from "@/lib/auth-context";

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
