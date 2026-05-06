import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { SignupRegistrationFields } from "@/lib/auth/submit-signup-registration";

type Props = {
  name: string;
  onChange: (field: keyof SignupRegistrationFields, value: string) => void;
};

export function SignupFullNameField({ name, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">Full Name</Label>
      <Input
        id="name"
        placeholder="John Doe"
        value={name}
        onChange={(e) => onChange("name", e.target.value)}
        required
      />
    </div>
  );
}
