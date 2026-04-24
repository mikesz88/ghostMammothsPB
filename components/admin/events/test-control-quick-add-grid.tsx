import { TestControlQuickAddButtons } from "@/components/admin/events/test-control-quick-add-buttons";
import { Label } from "@/components/ui/label";

export function TestControlQuickAddGrid(p: {
  loading: boolean;
  teamSizeCap: number;
  onAdd: (size: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Quick Add by Group Size</Label>
      <TestControlQuickAddButtons
        loading={p.loading}
        teamSizeCap={p.teamSizeCap}
        onAdd={p.onAdd}
      />
    </div>
  );
}
