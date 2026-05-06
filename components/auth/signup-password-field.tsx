import { AuthPasswordInputWithToggle } from "@/components/auth/auth-password-input-with-toggle";
import { Label } from "@/components/ui/label";

import type { SignupRegistrationFields } from "@/lib/auth/submit-signup-registration";

type Props = {
  password: string;
  showPassword: boolean;
  onChange: (field: keyof SignupRegistrationFields, value: string) => void;
  onToggleShow: () => void;
};

export function SignupPasswordField({
  password,
  showPassword,
  onChange,
  onToggleShow,
}: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <AuthPasswordInputWithToggle
        id="password"
        value={password}
        show={showPassword}
        onValueChange={(v) => onChange("password", v)}
        onToggleShow={onToggleShow}
        minLength={6}
        ariaLabelShowHide={showPassword ? "Hide password" : "Show password"}
      />
      <p className="text-xs text-muted-foreground">
        Must be at least 6 characters
      </p>
    </div>
  );
}
