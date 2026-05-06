import { TestControlGroupSizeOptions } from "@/components/admin/events/test-control-group-size-options";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TestControlGroupSizeField({
  groupSize,
  teamSizeCap,
  onGroupSizeChange,
}: {
  groupSize: number;
  teamSizeCap: number;
  onGroupSizeChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="group-size">Group Size for Testing</Label>
      <Select value={groupSize.toString()} onValueChange={onGroupSizeChange}>
        <SelectTrigger id="group-size">
          <SelectValue />
        </SelectTrigger>
        <TestControlGroupSizeOptions teamSizeCap={teamSizeCap} />
      </Select>
    </div>
  );
}
