import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { SignupRegistrationFields } from "@/lib/auth/submit-signup-registration";

type Props = {
  email: string;
  onChange: (field: keyof SignupRegistrationFields, value: string) => void;
};

export function SignupRegisterEmailField({ email, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => onChange("email", e.target.value)}
        required
      />
    </div>
  );
}
