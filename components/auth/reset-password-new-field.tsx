import { AuthPasswordInputWithToggle } from "@/components/auth/auth-password-input-with-toggle";
import { Label } from "@/components/ui/label";

type Props = {
  password: string;
  showPassword: boolean;
  onPasswordChange: (v: string) => void;
  onToggleShow: () => void;
};

export function ResetPasswordNewField({
  password,
  showPassword,
  onPasswordChange,
  onToggleShow,
}: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="new-password">New password</Label>
      <AuthPasswordInputWithToggle
        id="new-password"
        value={password}
        show={showPassword}
        onValueChange={onPasswordChange}
        onToggleShow={onToggleShow}
        minLength={8}
        autoComplete="new-password"
        ariaLabelShowHide={showPassword ? "Hide password" : "Show password"}
      />
    </div>
  );
}
