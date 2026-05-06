"use client";

import {
  flowCourtCountChange,
  flowResetTestEvent,
  flowRotationTypeChange,
  flowTeamSizeChange,
} from "@/lib/hooks/test-control-flows";

import type { UseTestControlsArgs } from "@/lib/hooks/test-controls-types";
import type { useTestControlFields } from "@/lib/hooks/use-test-control-fields";
import type { RotationType } from "@/lib/types";

type Fields = ReturnType<typeof useTestControlFields>;
type RunFn = (
  fn: () => Promise<void>,
  errLabel: string,
) => Promise<void>;

function createTestControlResetHandler(p: UseTestControlsArgs, run: RunFn) {
  return () =>
    run(() => flowResetTestEvent(p.eventId), "Error resetting event");
}

function createTestControlRotationHandler(
  p: UseTestControlsArgs,
  f: Fields,
  run: RunFn,
) {
  return (newType: RotationType) =>
    run(async () => {
      f.setRotationType(newType);
      const ok = await flowRotationTypeChange(p.eventId, newType);
      if (!ok) f.setRotationType(p.currentRotationType);
    }, "Error updating rotation type");
}

function createTestControlTeamSizeHandler(
  p: UseTestControlsArgs,
  f: Fields,
  run: RunFn,
) {
  return (newSize: string) =>
    run(async () => {
      const size = Number(newSize);
      f.setTeamSize(size);
      if (f.groupSize > size) f.setGroupSize(size);
      const ok = await flowTeamSizeChange(p.eventId, size);
      if (!ok) f.setTeamSize(p.currentTeamSize);
    }, "Error updating team size");
}

function createTestControlCourtCountHandler(
  p: UseTestControlsArgs,
  f: Fields,
  run: RunFn,
) {
  return (newCount: string) =>
    run(async () => {
      const count = Number(newCount);
      f.setCourtCount(count);
      const ok = await flowCourtCountChange(p.eventId, count);
      if (!ok) f.setCourtCount(p.currentCourtCount);
    }, "Error updating court count");
}

export function createTestControlSetupHandlers(
  p: UseTestControlsArgs,
  f: Fields,
  run: RunFn,
) {
  return {
    handleReset: createTestControlResetHandler(p, run),
    handleRotationChange: createTestControlRotationHandler(p, f, run),
    handleTeamSizeChange: createTestControlTeamSizeHandler(p, f, run),
    handleCourtCountChange: createTestControlCourtCountHandler(p, f, run),
  };
}
