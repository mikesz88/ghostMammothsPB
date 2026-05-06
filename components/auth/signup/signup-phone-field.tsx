import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { SignupRegistrationFields } from "@/lib/auth/submit-signup-registration";

type Props = {
  phone: string;
  onChange: (field: keyof SignupRegistrationFields, value: string) => void;
};

export function SignupPhoneField({ phone, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Phone</Label>
      <Input
        id="phone"
        type="tel"
        placeholder="(555) 123-4567"
        value={phone}
        onChange={(e) => onChange("phone", e.target.value)}
        required
      />
    </div>
  );
}
