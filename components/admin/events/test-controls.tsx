"use client";

import { TestControlBulkActions } from "@/components/admin/events/test-control-bulk-actions";
import { TestControlCourtCountField } from "@/components/admin/events/test-control-court-count-field";
import { TestControlGroupSizeField } from "@/components/admin/events/test-control-group-size-field";
import { TestControlQuickAddGrid } from "@/components/admin/events/test-control-quick-add-grid";
import { TestControlRotationField } from "@/components/admin/events/test-control-rotation-field";
import { TestControlTeamSizeField } from "@/components/admin/events/test-control-team-size-field";
import { TestControlsCardShell } from "@/components/admin/events/test-controls-card-shell";
import { TestControlsResetRow } from "@/components/admin/events/test-controls-reset-row";
import { useTestControls } from "@/lib/hooks/use-test-controls";

import type { RotationType } from "@/lib/types";

type TestControlsHandle = ReturnType<typeof useTestControls>;

interface TestControlsProps {
  eventId: string;
  currentRotationType: RotationType;
  currentTeamSize: number;
  currentCourtCount: number;
  /** Called after queue-changing actions so admin UI refreshes without full reload. */
  onQueueUpdated?: () => void | Promise<void>;
}

function TestControlsResetCourtTeam({ h }: { h: TestControlsHandle }) {
  return (
    <>
      <TestControlsResetRow loading={h.loading} onReset={h.handleReset} />
      <TestControlCourtCountField
        courtCount={h.courtCount}
        onCourtCountChange={h.handleCourtCountChange}
      />
      <TestControlTeamSizeField
        teamSize={h.teamSize}
        onTeamSizeChange={h.handleTeamSizeChange}
      />
    </>
  );
}

function TestControlsRotationGroup({ h }: { h: TestControlsHandle }) {
  return (
    <>
      <TestControlRotationField
        rotationType={h.rotationType}
        teamSizeCap={h.currentTeamSize}
        onRotationChange={h.handleRotationChange}
      />
      <TestControlGroupSizeField
        groupSize={h.groupSize}
        teamSizeCap={h.currentTeamSize}
        onGroupSizeChange={(val) => h.setGroupSize(Number(val))}
      />
    </>
  );
}

function TestControlsActionFields({ h }: { h: TestControlsHandle }) {
  return (
    <>
      <TestControlQuickAddGrid
        loading={h.loading}
        teamSizeCap={h.currentTeamSize}
        onAdd={h.handleAddDummyToQueue}
      />
      <TestControlBulkActions
        loading={h.loading}
        groupSize={h.groupSize}
        onAddDefaultGroup={() => h.handleAddDummyToQueue()}
        onClearAll={h.handleClearAll}
        onFillAllCourts={h.handleFillAllCourts}
      />
    </>
  );
}

export function TestControls({
  eventId,
  currentRotationType,
  currentTeamSize,
  currentCourtCount,
  onQueueUpdated,
}: TestControlsProps) {
  const h = useTestControls({
    eventId,
    currentRotationType,
    currentTeamSize,
    currentCourtCount,
    onQueueUpdated,
  });
  return (
    <TestControlsCardShell>
      <TestControlsResetCourtTeam h={h} />
      <TestControlsRotationGroup h={h} />
      <TestControlsActionFields h={h} />
    </TestControlsCardShell>
  );
}
