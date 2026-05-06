"use client";

import { createTestControlHandlers } from "@/lib/hooks/create-test-control-handlers";
import { useTestControlFields } from "@/lib/hooks/use-test-control-fields";
import { useTestControlRun } from "@/lib/hooks/use-test-control-run";

import type { UseTestControlsArgs } from "@/lib/hooks/test-controls-types";

export type { UseTestControlsArgs } from "@/lib/hooks/test-controls-types";

export function useTestControls(p: UseTestControlsArgs) {
  const { loading, run } = useTestControlRun();
  const f = useTestControlFields(p);
  const h = createTestControlHandlers(p, f, run);
  return {
    loading,
    rotationType: f.rotationType,
    teamSize: f.teamSize,
    courtCount: f.courtCount,
    groupSize: f.groupSize,
    setGroupSize: f.setGroupSize,
    ...h,
    currentTeamSize: p.currentTeamSize,
  };
}
