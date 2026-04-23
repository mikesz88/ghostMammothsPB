import { AuthPasswordInputWithToggle } from "@/components/auth/auth-password-input-with-toggle";
import { Label } from "@/components/ui/label";

import type { SignupRegistrationFields } from "@/lib/auth/submit-signup-registration";

type Props = {
  confirmPassword: string;
  showConfirmPassword: boolean;
  onChange: (field: keyof SignupRegistrationFields, value: string) => void;
  onToggleShow: () => void;
};

export function SignupConfirmPasswordField({
  confirmPassword,
  showConfirmPassword,
  onChange,
  onToggleShow,
}: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="confirmPassword">Confirm Password</Label>
      <AuthPasswordInputWithToggle
        id="confirmPassword"
        value={confirmPassword}
        show={showConfirmPassword}
        onValueChange={(v) => onChange("confirmPassword", v)}
        onToggleShow={onToggleShow}
        minLength={6}
        ariaLabelShowHide={
          showConfirmPassword ? "Hide confirm password" : "Show confirm password"
        }
      />
    </div>
  );
}
