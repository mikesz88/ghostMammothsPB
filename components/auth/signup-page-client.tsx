"use client";

import { useState } from "react";

import { SignupRegistrationForm } from "@/components/auth/signup-registration-form";
import { SignupVerifyEmailCard } from "@/components/auth/signup-verify-email-card";
import { useAuth } from "@/lib/auth-context";
import { useSyncSignupPendingTier } from "@/lib/hooks/use-sync-signup-pending-tier";

type Props = {
  flow: string | null;
  tier: string | null;
};

export function SignupPageClient({ flow, tier }: Props) {
  useSyncSignupPendingTier(flow, tier);
  const [success, setSuccess] = useState(flow === "confirm-email");
  const { signUp } = useAuth();

  if (success) {
    return <SignupVerifyEmailCard />;
  }

  return <SignupRegistrationForm signUp={signUp} onSuccess={() => setSuccess(true)} />;
}
