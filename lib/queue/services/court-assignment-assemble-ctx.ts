import { countSlotsForEntries } from "@/lib/queue/mappers";
import { resolveNextPlayersForCourt } from "@/lib/queue/services/court-assignment-helpers";
import { computeNewFromQueue } from "@/lib/queue/services/court-assignment-queue-pick";

import type {
  CourtPendingStayerRow,
  EventRow,
  ManagerEntry,
} from "@/lib/queue/services/court-assignment-helpers";
import type { LoadCourtAssignmentResult } from "@/lib/queue/services/court-assignment-types";
import type { DbClient } from "@/lib/queue/types";
import type { RotationType } from "@/lib/types";

export type AssembleCtxParams = {
  supabase: DbClient;
  event: EventRow;
  availableCourt: number;
  playersPerCourt: number;
  rotationType: RotationType;
  stayingMapped: ManagerEntry[];
  pendingRow: CourtPendingStayerRow;
  waitingQueue: ManagerEntry[];
  QueueManager: typeof import("@/lib/queue-manager").QueueManager;
};

function successReadyResult(
  p: AssembleCtxParams,
  nextPlayers: ManagerEntry[],
): LoadCourtAssignmentResult {
  return {
    success: true,
    ctx: {
      supabase: p.supabase,
      event: p.event,
      availableCourt: p.availableCourt,
      playersPerCourt: p.playersPerCourt,
      rotationType: p.rotationType,
      stayingMapped: p.stayingMapped,
      pendingRow: p.pendingRow,
      nextPlayers,
    },
  };
}

export function assembleCourtReadyContext(p: AssembleCtxParams): LoadCourtAssignmentResult {
  const stayingCount = countSlotsForEntries(p.stayingMapped);
  const playersNeeded = p.playersPerCourt - stayingCount;
  const queuePick = computeNewFromQueue({
    waitingQueue: p.waitingQueue,
    playersNeeded,
    stayingCount,
    playersPerCourt: p.playersPerCourt,
    QueueManager: p.QueueManager,
  });
  if (!("newFromQueue" in queuePick)) return queuePick;
  const nextResult = resolveNextPlayersForCourt({
    event: p.event,
    rotationType: p.rotationType,
    stayingMapped: p.stayingMapped,
    newFromQueue: queuePick.newFromQueue,
    playersPerCourt: p.playersPerCourt,
  });
  if (!nextResult.success) return nextResult;
  return successReadyResult(p, nextResult.nextPlayers);
}
