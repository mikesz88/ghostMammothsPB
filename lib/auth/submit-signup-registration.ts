import { validateSignupPasswords } from "@/lib/auth/validate-signup-passwords";

import type { AuthContextType } from "@/lib/auth-context";

type SignUp = AuthContextType["signUp"];

export type SignupRegistrationFields = {
  name: string;
  email: string;
  phone: string;
  skillLevel: string;
  password: string;
  confirmPassword: string;
};

export async function submitSignupRegistration(
  formData: SignupRegistrationFields,
  signUp: SignUp,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const validationError = validateSignupPasswords(
    formData.password,
    formData.confirmPassword,
  );
  if (validationError) {
    return { ok: false, error: validationError };
  }
  const { error } = await signUp(formData.email, formData.password, {
    name: formData.name,
    skillLevel: formData.skillLevel,
    phone: formData.phone || undefined,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
