"use client";

import { useState } from "react";

import type { AuthContextType } from "@/lib/auth-context";

type ResetPasswordForEmail = AuthContextType["resetPasswordForEmail"];

type ForgotCtx = {
  email: string;
  resetPasswordForEmail: ResetPasswordForEmail;
  setError: (v: string | null) => void;
  setLoading: (v: boolean) => void;
  setSent: (v: boolean) => void;
};

async function runForgotPasswordSubmit(ctx: ForgotCtx) {
  ctx.setLoading(true);
  ctx.setError(null);
  const { error: resetError } = await ctx.resetPasswordForEmail(
    ctx.email.trim(),
  );
  ctx.setLoading(false);
  if (resetError) {
    ctx.setError(
      resetError.message ?? "Something went wrong. Please try again.",
    );
    return;
  }
  ctx.setSent(true);
}

export function useForgotPasswordForm(resetPasswordForEmail: ResetPasswordForEmail) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runForgotPasswordSubmit({
      email,
      resetPasswordForEmail,
      setError,
      setLoading,
      setSent,
    });
  };

  return {
    email,
    setEmail,
    loading,
    error,
    sent,
    handleSubmit,
  };
}
