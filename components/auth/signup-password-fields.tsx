import { SignupConfirmPasswordField } from "@/components/auth/signup-confirm-password-field";
import { SignupPasswordField } from "@/components/auth/signup-password-field";

import type { SignupRegistrationFields } from "@/lib/auth/submit-signup-registration";

type Props = {
  formData: SignupRegistrationFields;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onChange: (field: keyof SignupRegistrationFields, value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirm: () => void;
};

export function SignupPasswordFields({
  formData,
  showPassword,
  showConfirmPassword,
  onChange,
  onTogglePassword,
  onToggleConfirm,
}: Props) {
  return (
    <>
      <SignupPasswordField
        password={formData.password}
        showPassword={showPassword}
        onChange={onChange}
        onToggleShow={onTogglePassword}
      />
      <SignupConfirmPasswordField
        confirmPassword={formData.confirmPassword}
        showConfirmPassword={showConfirmPassword}
        onChange={onChange}
        onToggleShow={onToggleConfirm}
      />
    </>
  );
}

