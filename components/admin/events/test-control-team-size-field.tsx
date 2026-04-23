import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TestControlTeamSizeField({
  teamSize,
  onTeamSizeChange,
}: {
  teamSize: number;
  onTeamSizeChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="team-size">Change Team Size (Court Type)</Label>
      <Select value={teamSize.toString()} onValueChange={onTeamSizeChange}>
        <SelectTrigger id="team-size">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Solo (1v1)</SelectItem>
          <SelectItem value="2">Doubles (2v2)</SelectItem>
          <SelectItem value="3">Triplets (3v3)</SelectItem>
          <SelectItem value="4">Quads (4v4)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
