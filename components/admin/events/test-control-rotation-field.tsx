import { TestControlRotationOptions } from "@/components/admin/events/test-control-rotation-options";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { RotationType } from "@/lib/types";

export function TestControlRotationField({
  rotationType,
  teamSizeCap,
  onRotationChange,
}: {
  rotationType: RotationType;
  teamSizeCap: number;
  onRotationChange: (value: RotationType) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="rotation-type">Change Rotation Type</Label>
      <Select value={rotationType} onValueChange={onRotationChange}>
        <SelectTrigger id="rotation-type">
          <SelectValue />
        </SelectTrigger>
        <TestControlRotationOptions teamSizeCap={teamSizeCap} />
      </Select>
    </div>
  );
}
