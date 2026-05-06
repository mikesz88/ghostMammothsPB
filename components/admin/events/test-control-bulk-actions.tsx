import { TestControlAddGroupButton } from "@/components/admin/events/test-control-add-group-button";
import { TestControlClearAllButton } from "@/components/admin/events/test-control-clear-all-button";
import { TestControlFillCourtsButton } from "@/components/admin/events/test-control-fill-courts-button";

type TestControlBulkActionsProps = {
  loading: boolean;
  groupSize: number;
  onAddDefaultGroup: () => void;
  onClearAll: () => void;
  onFillAllCourts: () => void;
};

export function TestControlBulkActions(p: TestControlBulkActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <TestControlAddGroupButton
        loading={p.loading}
        groupSize={p.groupSize}
        onAddDefaultGroup={p.onAddDefaultGroup}
      />
      <TestControlClearAllButton loading={p.loading} onClearAll={p.onClearAll} />
      <TestControlFillCourtsButton
        loading={p.loading}
        onFillAllCourts={p.onFillAllCourts}
      />
    </div>
  );
}
