"use client";

import {
  flowAddDummyToQueue,
  flowClearTestEvent,
  flowFillAllCourts,
} from "@/lib/hooks/test-control-flows";

import type { UseTestControlsArgs } from "@/lib/hooks/test-controls-types";
import type { useTestControlFields } from "@/lib/hooks/use-test-control-fields";

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
          flowAddDummyToQueue(
            p.eventId,
            size ?? f.groupSize,
            p.currentTeamSize,
            p.onQueueUpdated,
          ),
        "Error adding users",
      ),
    handleClearAll: () =>
      run(() => flowClearTestEvent(p.eventId), "Error clearing event"),
    handleFillAllCourts: () =>
      run(() => flowFillAllCourts(p.eventId), "Error filling courts"),
  };
}
