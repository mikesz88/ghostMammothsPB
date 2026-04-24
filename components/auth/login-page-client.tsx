"use client";

import { LoginFormCard } from "@/components/auth/login-form-card";
import { LoginRedirectWhenAuthed } from "@/components/auth/login-redirect-when-authed";
import { useAuth } from "@/lib/auth-context";

type Props = {
  initialMessage: string | null;
};

export function LoginPageClient({ initialMessage }: Props) {
  const { user, loading: authLoading, signIn, resendVerificationEmail } =
    useAuth();
  return (
    <>
      <LoginRedirectWhenAuthed user={user} authLoading={authLoading} />
      <LoginFormCard
        initialMessage={initialMessage}
        signIn={signIn}
        resendVerificationEmail={resendVerificationEmail}
      />
    </>
  );
}
