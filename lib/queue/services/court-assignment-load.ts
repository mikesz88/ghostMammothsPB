import { assembleCourtReadyContext } from "@/lib/queue/services/court-assignment-assemble-ctx";
import {
  deleteStaleEndedAssignmentsOnCourt,
  fetchEventForCourtAssignment,
  loadStayingMappedForCourt,
  loadWaitingQueueMapped,
  resolveFirstAvailableCourtNumber,
  type AssignPlayersFail,
  type CourtPendingStayerRow,
  type EventRow,
  type ManagerEntry,
} from "@/lib/queue/services/court-assignment-helpers";

import type { LoadCourtAssignmentResult } from "@/lib/queue/services/court-assignment-types";
import type { DbClient } from "@/lib/queue/types";
import type { RotationType } from "@/lib/types";

export type { CourtAssignmentReadyCtx, LoadCourtAssignmentResult } from "@/lib/queue/services/court-assignment-types";

type QueueSlicesOk = {
  stayingMapped: ManagerEntry[];
  pendingRow: CourtPendingStayerRow;
  waitingQueue: ManagerEntry[];
};

async function resolveEventRowAndCourtPick(
  supabase: DbClient,
  eventId: string,
): Promise<
  | AssignPlayersFail
  | { event: EventRow; availableCourt: number; playersPerCourt: number }
> {
  const eventResult = await fetchEventForCourtAssignment(supabase, eventId);
  if (!eventResult.success) return eventResult;
  const { event } = eventResult;
  const playersPerCourt = event.team_size * 2;
  const courtPick = await resolveFirstAvailableCourtNumber(
    supabase,
    eventId,
    event.court_count,
  );
  if (!courtPick.success) return courtPick;
  await deleteStaleEndedAssignmentsOnCourt(supabase, eventId, courtPick.courtNumber);
  return { event, availableCourt: courtPick.courtNumber, playersPerCourt };
}

async function loadQueueSlicesForCourtAssignment(
  supabase: DbClient,
  eventId: string,
  availableCourt: number,
  playersPerCourt: number,
): Promise<AssignPlayersFail | QueueSlicesOk> {
  const stay = await loadStayingMappedForCourt(
    supabase,
    eventId,
    availableCourt,
    playersPerCourt,
  );
  if (!stay.success) return stay;
  const wait = await loadWaitingQueueMapped(supabase, eventId);
  if (!wait.success) return wait;
  return {
    stayingMapped: stay.stayingMapped,
    pendingRow: stay.pendingRow,
    waitingQueue: wait.waitingQueue,
  };
}

export async function loadCourtAssignmentReady(
  supabase: DbClient,
  eventId: string,
): Promise<LoadCourtAssignmentResult> {
  const resolved = await resolveEventRowAndCourtPick(supabase, eventId);
  if (!("event" in resolved)) return resolved;
  const { event, availableCourt, playersPerCourt } = resolved;
  const { QueueManager } = await import("@/lib/queue-manager");
  const slices = await loadQueueSlicesForCourtAssignment(
    supabase,
    eventId,
    availableCourt,
    playersPerCourt,
  );
  if (!("waitingQueue" in slices)) return slices;
  return assembleCourtReadyContext({
    supabase,
    event,
    availableCourt,
    playersPerCourt,
    rotationType: event.rotation_type as RotationType,
    QueueManager,
    ...slices,
  });
}
