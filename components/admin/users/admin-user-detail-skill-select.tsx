import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminUserDetailSkillSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

export function AdminUserDetailSkillSelect({
  value,
  onChange,
}: AdminUserDetailSkillSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="skill">Skill Level</Label>
      <Select value={value} onValueChange={onChange}>
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
