"use client";

import { useEffect, useState } from "react";

import { runAfterSignInNavigation } from "@/lib/auth/run-after-sign-in-navigation";
import { submitLoginCredentials } from "@/lib/auth/submit-login-credentials";

import type { AuthContextType } from "@/lib/auth-context";

type SignIn = AuthContextType["signIn"];
type Resend = AuthContextType["resendVerificationEmail"];

type LoginSubmitCtx = {
  email: string;
  password: string;
  signIn: SignIn;
  setError: (v: string | null) => void;
  setLoading: (v: boolean) => void;
};

async function runLoginSubmit(ctx: LoginSubmitCtx) {
  ctx.setLoading(true);
  ctx.setError(null);
  try {
    const result = await submitLoginCredentials(
      ctx.email,
      ctx.password,
      ctx.signIn,
    );
    if (!result.ok) {
      ctx.setError(result.error);
    } else {
      await runAfterSignInNavigation();
    }
  } catch {
    ctx.setError("An unexpected error occurred");
  } finally {
    ctx.setLoading(false);
  }
}

type ResendCtx = {
  email: string;
  resendVerificationEmail: Resend;
  setResendLoading: (v: boolean) => void;
  setResendMessage: (v: string | null) => void;
};

async function runResendVerification(ctx: ResendCtx) {
  if (!ctx.email?.trim()) {
    return;
  }
  ctx.setResendLoading(true);
  ctx.setResendMessage(null);
  const { error: resendError } = await ctx.resendVerificationEmail(
    ctx.email.trim(),
  );
  ctx.setResendLoading(false);
  if (resendError) {
    ctx.setResendMessage(resendError.message ?? "Failed to resend email.");
  } else {
    ctx.setResendMessage(
      "Verification email sent. Check your inbox and click the link.",
    );
  }
}

function useLoginFieldState() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
  };
}

function useLoginFeedbackState(initialMessage: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(initialMessage);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    setMessage(initialMessage);
  }, [initialMessage]);

  return {
    loading,
    setLoading,
    error,
    setError,
    message,
    resendLoading,
    setResendLoading,
    resendMessage,
    setResendMessage,
  };
}

type FieldState = ReturnType<typeof useLoginFieldState>;
type FeedbackState = ReturnType<typeof useLoginFeedbackState>;

function buildLoginSubmitHandler(
  fields: FieldState,
  feedback: FeedbackState,
  signIn: SignIn,
) {
  return (e: React.FormEvent) => {
    e.preventDefault();
    feedback.setResendMessage(null);
    void runLoginSubmit({
      email: fields.email,
      password: fields.password,
      signIn,
      setError: feedback.setError,
      setLoading: feedback.setLoading,
    });
  };
}

function buildResendHandler(
  fields: FieldState,
  feedback: FeedbackState,
  resendVerificationEmail: Resend,
) {
  return () => {
    void runResendVerification({
      email: fields.email,
      resendVerificationEmail,
      setResendLoading: feedback.setResendLoading,
      setResendMessage: feedback.setResendMessage,
    });
  };
}

export function useLoginForm(
  initialMessage: string | null,
  signIn: SignIn,
  resendVerificationEmail: Resend,
) {
  const fields = useLoginFieldState();
  const feedback = useLoginFeedbackState(initialMessage);
  const onSubmit = buildLoginSubmitHandler(fields, feedback, signIn);
  const onResendVerification = buildResendHandler(
    fields,
    feedback,
    resendVerificationEmail,
  );
  const isEmailNotConfirmed =
    feedback.error?.toLowerCase().includes("email not confirmed") ?? false;
  return {
    ...fields,
    ...feedback,
    onSubmit,
    onResendVerification,
    isEmailNotConfirmed,
  };
}

export type UseLoginFormReturn = ReturnType<typeof useLoginForm>;
