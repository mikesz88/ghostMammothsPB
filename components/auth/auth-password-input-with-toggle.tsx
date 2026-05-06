import { PasswordVisibilityToggleButton } from "@/components/auth/password-visibility-toggle-button";
import { Input } from "@/components/ui/input";

type Props = {
  id: string;
  value: string;
  show: boolean;
  onValueChange: (v: string) => void;
  onToggleShow: () => void;
  minLength?: number;
  autoComplete?: string;
  ariaLabelShowHide: string;
};

export function AuthPasswordInputWithToggle(p: Props) {
  return (
    <div className="relative">
      <Input
        id={p.id}
        type={p.show ? "text" : "password"}
        value={p.value}
        onChange={(e) => p.onValueChange(e.target.value)}
        required
        minLength={p.minLength}
        autoComplete={p.autoComplete}
        className="pr-10"
      />
      <PasswordVisibilityToggleButton
        show={p.show}
        onToggle={p.onToggleShow}
        ariaLabel={p.ariaLabelShowHide}
      />
    </div>
  );
}
