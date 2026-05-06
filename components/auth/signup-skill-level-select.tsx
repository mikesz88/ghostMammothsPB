import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { SignupRegistrationFields } from "@/lib/auth/submit-signup-registration";

type Props = {
  skillLevel: string;
  onChange: (field: keyof SignupRegistrationFields, value: string) => void;
};

export function SignupSkillLevelSelect({ skillLevel, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="skill">Skill Level</Label>
      <Select
        value={skillLevel}
        onValueChange={(value) => onChange("skillLevel", value)}
      >
        <SelectTrigger id="skill">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
