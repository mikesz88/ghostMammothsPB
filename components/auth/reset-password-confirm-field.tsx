import { AuthPasswordInputWithToggle } from "@/components/auth/auth-password-input-with-toggle";
import { Label } from "@/components/ui/label";

type Props = {
  confirmPassword: string;
  showConfirmPassword: boolean;
  onConfirmChange: (v: string) => void;
  onToggleShow: () => void;
};

export function ResetPasswordConfirmField({
  confirmPassword,
  showConfirmPassword,
  onConfirmChange,
  onToggleShow,
}: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="confirm-password">Confirm new password</Label>
      <AuthPasswordInputWithToggle
        id="confirm-password"
        value={confirmPassword}
        show={showConfirmPassword}
        onValueChange={onConfirmChange}
        onToggleShow={onToggleShow}
        minLength={8}
        autoComplete="new-password"
        ariaLabelShowHide={
          showConfirmPassword ? "Hide password" : "Show password"
        }
      />
    </div>
  );
}
