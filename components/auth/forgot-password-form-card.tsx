"use client";

import { ForgotPasswordCardShell } from "@/components/auth/forgot-password-card-shell";
import { ForgotPasswordRequestForm } from "@/components/auth/forgot-password-request-form";
import { ForgotPasswordSentPanel } from "@/components/auth/forgot-password-sent-panel";
import { useForgotPasswordForm } from "@/lib/hooks/use-forgot-password-form";

import type { AuthContextType } from "@/lib/auth-context";

type Props = {
  resetPasswordForEmail: AuthContextType["resetPasswordForEmail"];
};

export function ForgotPasswordFormCard({ resetPasswordForEmail }: Props) {
  const f = useForgotPasswordForm(resetPasswordForEmail);
  return (
    <ForgotPasswordCardShell>
      {f.sent ? (
        <ForgotPasswordSentPanel />
      ) : (
        <ForgotPasswordRequestForm
          email={f.email}
          loading={f.loading}
          error={f.error}
          onEmailChange={f.setEmail}
          onSubmit={f.handleSubmit}
        />
      )}
    </ForgotPasswordCardShell>
  );
}
