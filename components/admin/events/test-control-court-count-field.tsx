import { TestControlCourtCountOptions } from "@/components/admin/events/test-control-court-count-options";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TestControlCourtCountField({
  courtCount,
  onCourtCountChange,
}: {
  courtCount: number;
  onCourtCountChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="court-count">Number of Courts</Label>
      <Select
        value={courtCount.toString()}
        onValueChange={onCourtCountChange}
      >
        <SelectTrigger id="court-count">
          <SelectValue />
        </SelectTrigger>
        <TestControlCourtCountOptions />
      </Select>
    </div>
  );
}
