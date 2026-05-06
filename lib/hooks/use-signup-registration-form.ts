"use client";

import { useState } from "react";

import { createSignupRegistrationFormInitial } from "@/lib/auth/signup-registration-form-initial";
import { submitSignupRegistration } from "@/lib/auth/submit-signup-registration";

import type { SignupRegistrationFields } from "@/lib/auth/submit-signup-registration";
import type { AuthContextType } from "@/lib/auth-context";

type SignUp = AuthContextType["signUp"];

type SignupSubmitCtx = {
  formData: SignupRegistrationFields;
  signUp: SignUp;
  setError: (v: string | null) => void;
  setLoading: (v: boolean) => void;
  onSuccess: () => void;
};

async function runSignupFormSubmit(ctx: SignupSubmitCtx) {
  ctx.setLoading(true);
  ctx.setError(null);
  try {
    const result = await submitSignupRegistration(ctx.formData, ctx.signUp);
    if (!result.ok) {
      ctx.setError(result.error);
    } else {
      ctx.onSuccess();
    }
  } catch {
    ctx.setError("An unexpected error occurred");
  } finally {
    ctx.setLoading(false);
  }
}

function useSignupFormFieldState() {
  const [formData, setFormData] = useState(createSignupRegistrationFormInitial);
  const handleInputChange = (
    field: keyof SignupRegistrationFields,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  return { formData, handleInputChange };
}

function useSignupPasswordVisibility() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return {
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  };
}

function buildSignupSubmitHandler(ctx: SignupSubmitCtx) {
  return (e: React.FormEvent) => {
    e.preventDefault();
    void runSignupFormSubmit(ctx);
  };
}

export function useSignupRegistrationForm(signUp: SignUp, onSuccess: () => void) {
  const { formData, handleInputChange } = useSignupFormFieldState();
  const visibility = useSignupPasswordVisibility();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = buildSignupSubmitHandler({
    formData,
    signUp,
    setError,
    setLoading,
    onSuccess,
  });
  return {
    formData,
    loading,
    error,
    handleInputChange,
    handleSubmit,
    ...visibility,
  };
}

export type UseSignupRegistrationFormReturn = ReturnType<
  typeof useSignupRegistrationForm
>;
