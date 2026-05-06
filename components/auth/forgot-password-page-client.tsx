"use client";

import { ForgotPasswordFormCard } from "@/components/auth/forgot-password-form-card";
import { useAuth } from "@/lib/auth-context";

export function ForgotPasswordPageClient() {
  const { resetPasswordForEmail } = useAuth();
  return (
    <ForgotPasswordFormCard resetPasswordForEmail={resetPasswordForEmail} />
  );
}
