"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { validateResetPasswords } from "@/lib/auth/validate-reset-passwords";

import type { AuthContextType } from "@/lib/auth-context";

type UpdatePassword = AuthContextType["updatePassword"];
type SignOut = AuthContextType["signOut"];

async function finalizePasswordReset(
  password: string,
  updatePassword: UpdatePassword,
  signOut: SignOut,
  router: ReturnType<typeof useRouter>,
): Promise<string | null> {
  const { error: updateError } = await updatePassword(password);
  if (updateError) {
    return updateError.message ?? "Could not update password.";
  }
  await signOut();
  router.replace(
    "/login?message=" +
      encodeURIComponent(
        "Your password has been updated. Please sign in with your new password.",
      ),
  );
  return null;
}

function useResetPasswordInputs() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  };
}

type ResetInputs = ReturnType<typeof useResetPasswordInputs>;

type ResetAttemptCtx = {
  inputs: ResetInputs;
  updatePassword: UpdatePassword;
  signOut: SignOut;
  router: ReturnType<typeof useRouter>;
  setError: (v: string | null) => void;
  setLoading: (v: boolean) => void;
};

async function executeResetPasswordAttempt(ctx: ResetAttemptCtx) {
  ctx.setLoading(true);
  try {
    const err = await finalizePasswordReset(
      ctx.inputs.password,
      ctx.updatePassword,
      ctx.signOut,
      ctx.router,
    );
    if (err) {
      ctx.setError(err);
    }
  } finally {
    ctx.setLoading(false);
  }
}

type ResetFormBundle = {
  inputs: ResetInputs;
  updatePassword: UpdatePassword;
  signOut: SignOut;
  router: ReturnType<typeof useRouter>;
  setError: (v: string | null) => void;
  setLoading: (v: boolean) => void;
};

function createResetPasswordSubmitHandler(bundle: ResetFormBundle) {
  return async (e: React.FormEvent) => {
    e.preventDefault();
    bundle.setError(null);
    const validationError = validateResetPasswords(
      bundle.inputs.password,
      bundle.inputs.confirmPassword,
    );
    if (validationError) {
      bundle.setError(validationError);
      return;
    }
    await executeResetPasswordAttempt({
      inputs: bundle.inputs,
      updatePassword: bundle.updatePassword,
      signOut: bundle.signOut,
      router: bundle.router,
      setError: bundle.setError,
      setLoading: bundle.setLoading,
    });
  };
}

export function useResetPasswordForm(
  updatePassword: UpdatePassword,
  signOut: SignOut,
) {
  const router = useRouter();
  const inputs = useResetPasswordInputs();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = createResetPasswordSubmitHandler({
    inputs,
    updatePassword,
    signOut,
    router,
    setError,
    setLoading,
  });
  return {
    ...inputs,
    loading,
    error,
    handleSubmit,
  };
}

export type UseResetPasswordFormReturn = ReturnType<typeof useResetPasswordForm>;
