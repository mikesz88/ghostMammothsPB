"use client";

import { createTestControlQueueHandlers } from "@/lib/hooks/create-test-control-handlers-queue";
import { createTestControlSetupHandlers } from "@/lib/hooks/create-test-control-handlers-setup";

import type { UseTestControlsArgs } from "@/lib/hooks/test-controls-types";
import type { useTestControlFields } from "@/lib/hooks/use-test-control-fields";

type Fields = ReturnType<typeof useTestControlFields>;
type RunFn = (
  fn: () => Promise<void>,
  errLabel: string,
) => Promise<void>;

export function createTestControlHandlers(
  p: UseTestControlsArgs,
  f: Fields,
  run: RunFn,
) {
  return {
    ...createTestControlSetupHandlers(p, f, run),
    ...createTestControlQueueHandlers(p, f, run),
  };
}
