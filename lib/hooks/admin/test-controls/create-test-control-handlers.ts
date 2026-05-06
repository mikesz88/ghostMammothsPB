"use client";

import { createTestControlSetupHandlers } from "@/lib/hooks/admin/test-controls/create-test-control-handlers-setup";
import { createTestControlQueueHandlers } from "@/lib/hooks/queue/create-test-control-handlers-queue";

import type { UseTestControlsArgs } from "@/lib/hooks/admin/test-controls/test-controls-types";
import type { useTestControlFields } from "@/lib/hooks/admin/test-controls/use-test-control-fields";

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
