import { LoginPasswordLabelRow } from "@/components/auth/login/login-password-label-row";
import { AuthPasswordInputWithToggle } from "@/components/auth/shared/auth-password-input-with-toggle";

type Props = {
  password: string;
  showPassword: boolean;
  onPasswordChange: (v: string) => void;
  onToggleShowPassword: () => void;
};

export function LoginPasswordField({
  password,
  showPassword,
  onPasswordChange,
  onToggleShowPassword,
}: Props) {
  return (
    <div className="space-y-2">
      <LoginPasswordLabelRow />
      <AuthPasswordInputWithToggle
        id="password"
        value={password}
        show={showPassword}
        onValueChange={onPasswordChange}
        onToggleShow={onToggleShowPassword}
        ariaLabelShowHide={showPassword ? "Hide password" : "Show password"}
      />
    </div>
  );
}
