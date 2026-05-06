import {
  countSlotsForEntries,
  mapDbEntryToManagerEntry,
  type ManagerEntry,
} from "@/lib/queue/mappers";
import { is2Stay2OffRotation } from "@/lib/queue/rotation-policy";
import {
  orderedPlayers2Stay2OffDoubles,
  partitionMultiSlotEntriesFirstForDoubles,
} from "@/lib/queue/services/court-assignment-next-players-order";

import type { DbClient, QueueEntryWithUser } from "@/lib/queue/types";
import type { RotationType } from "@/lib/types";
import type { Database } from "@/supabase/supa-schema";

export { loadStayingMappedForCourt } from "./load-staying-mapped-for-court";
export type { ManagerEntry };
export type { PlayerSlot } from "@/lib/queue/services/court-assignment-expand-slots";
export {
  buildCourtAssignmentInsert,
  expandNextPlayersToPlayerSlots,
} from "@/lib/queue/services/court-assignment-expand-slots";

export type AssignPlayersFail = { success: false; error: string };

export type EventRow = Database["public"]["Tables"]["events"]["Row"];

export type CourtPendingStayerRow =
  | Database["public"]["Tables"]["court_pending_stayers"]["Row"]
  | null;

export async function fetchEventForCourtAssignment(
  supabase: DbClient,
  eventId: string,
): Promise<AssignPlayersFail | { success: true; event: EventRow }> {
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { success: false, error: "Event not found" };
  }
  return { success: true, event };
}

export async function resolveFirstAvailableCourtNumber(
  supabase: DbClient,
  eventId: string,
  courtCount: number,
): Promise<AssignPlayersFail | { success: true; courtNumber: number }> {
  const { data: activeAssignments } = await supabase
    .from("court_assignments")
    .select("court_number")
    .eq("event_id", eventId)
    .is("ended_at", null);

  const activeCourts = new Set(
    activeAssignments?.map((a) => a.court_number) || [],
  );

  for (let i = 1; i <= courtCount; i++) {
    if (!activeCourts.has(i)) {
      return { success: true, courtNumber: i };
    }
  }
  return { success: false, error: "No available courts" };
}

export async function deleteStaleEndedAssignmentsOnCourt(
  supabase: DbClient,
  eventId: string,
  courtNumber: number,
) {
  await supabase
    .from("court_assignments")
    .delete()
    .eq("event_id", eventId)
    .eq("court_number", courtNumber)
    .not("ended_at", "is", null);
}

export async function loadWaitingQueueMapped(
  supabase: DbClient,
  eventId: string,
): Promise<
  AssignPlayersFail | { success: true; waitingQueue: ManagerEntry[] }
> {
  const { data: queueData, error: queueError } = await supabase
    .from("queue_entries")
    .select(
      `
      *,
      user:users(id, name, email, skill_level)
    `,
    )
    .eq("event_id", eventId)
    .eq("status", "waiting")
    .order("position");

  if (queueError) {
    return { success: false, error: "Failed to fetch queue" };
  }

  const waitingQueue = (queueData || []).map((entry: QueueEntryWithUser) =>
    mapDbEntryToManagerEntry(entry),
  );
  return { success: true, waitingQueue };
}

export type ResolveNextPlayersParams = {
  event: EventRow;
  rotationType: RotationType;
  stayingMapped: ManagerEntry[];
  newFromQueue: ManagerEntry[];
  playersPerCourt: number;
};

export function resolveNextPlayersForCourt(
  params: ResolveNextPlayersParams,
): AssignPlayersFail | { success: true; nextPlayers: ManagerEntry[] } {
  const { event, rotationType, stayingMapped, newFromQueue, playersPerCourt } =
    params;
  let nextPlayers: ManagerEntry[] = [...stayingMapped, ...newFromQueue];
  if (is2Stay2OffRotation(rotationType) && event.team_size === 2) {
    const reordered = orderedPlayers2Stay2OffDoubles(
      stayingMapped,
      newFromQueue,
    );
    if (reordered) nextPlayers = reordered;
  }

  if (event.team_size === 2) {
    nextPlayers = partitionMultiSlotEntriesFirstForDoubles(nextPlayers);
  }

  const totalSlots = countSlotsForEntries(nextPlayers);
  if (totalSlots !== playersPerCourt) {
    return {
      success: false,
      error: "Could not form a full court from queue and pending stayers.",
    };
  }
  return { success: true, nextPlayers };
}
