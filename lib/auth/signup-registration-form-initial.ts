import type { SignupRegistrationFields } from "@/lib/auth/submit-signup-registration";

export function createSignupRegistrationFormInitial(): SignupRegistrationFields {
  return {
    name: "",
    email: "",
    phone: "",
    skillLevel: "intermediate",
    password: "",
    confirmPassword: "",
  };
}
