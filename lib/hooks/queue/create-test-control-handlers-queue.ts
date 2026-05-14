"use client";

import {
  flowAddDummyToQueue,
  flowClearTestEvent,
  flowFillAllCourts,
} from "@/lib/hooks/admin/test-controls/test-control-flows";

import type { UseTestControlsArgs } from "@/lib/hooks/admin/test-controls/test-controls-types";
import type { useTestControlFields } from "@/lib/hooks/admin/test-controls/use-test-control-fields";

type Fields = ReturnType<typeof useTestControlFields>;
type RunFn = (
  fn: () => Promise<void>,
  errLabel: string,
) => Promise<void>;

export function createTestControlQueueHandlers(
  p: UseTestControlsArgs,
  f: Fields,
  run: RunFn,
) {
  return {
    handleAddDummyToQueue: (size?: number) =>
      run(
        () =>
          flowAddDummyToQueue({
            eventId: p.eventId,
            addGroupSize: size ?? f.groupSize,
            currentTeamSize: p.currentTeamSize,
            currentRotationType: f.rotationType,
            onQueueUpdated: p.onQueueUpdated,
          }),
        "Error adding users",
      ),
    handleClearAll: () =>
      run(() => flowClearTestEvent(p.eventId), "Error clearing event"),
    handleFillAllCourts: () =>
      run(() => flowFillAllCourts(p.eventId), "Error filling courts"),
  };
}
