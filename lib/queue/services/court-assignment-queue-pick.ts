import { countSlotsForEntries } from "@/lib/queue/mappers";

import type { AssignPlayersFail, ManagerEntry } from "@/lib/queue/services/court-assignment-helpers";

export type ComputeNewFromQueueParams = {
  waitingQueue: ManagerEntry[];
  playersNeeded: number;
  stayingCount: number;
  playersPerCourt: number;
  QueueManager: typeof import("@/lib/queue-manager").QueueManager;
};

function validatePlayersNeededCounts(
  playersNeeded: number,
  stayingCount: number,
  playersPerCourt: number,
): AssignPlayersFail | null {
  if (playersNeeded < 0) {
    return { success: false, error: "Invalid pending stayer count for this court." };
  }
  if (playersNeeded === 0 && stayingCount !== playersPerCourt) {
    return { success: false, error: "Pending stayers do not fill the court." };
  }
  return null;
}

function notEnoughSlotsError(playersNeeded: number): AssignPlayersFail {
  return {
    success: false,
    error: `Not enough players in queue. Need ${playersNeeded} more player slot(s) to fill the court.`,
  };
}

export function computeNewFromQueue(
  params: ComputeNewFromQueueParams,
): AssignPlayersFail | { newFromQueue: ManagerEntry[] } {
  const {
    waitingQueue,
    playersNeeded,
    stayingCount,
    playersPerCourt,
    QueueManager,
  } = params;
  const invalid = validatePlayersNeededCounts(playersNeeded, stayingCount, playersPerCourt);
  if (invalid) return invalid;
  if (playersNeeded <= 0) return { newFromQueue: [] };
  const newFromQueue = QueueManager.getNextPlayers(
    waitingQueue,
    playersNeeded,
  ) as ManagerEntry[];
  if (countSlotsForEntries(newFromQueue) < playersNeeded) {
    return notEnoughSlotsError(playersNeeded);
  }
  return { newFromQueue };
}
