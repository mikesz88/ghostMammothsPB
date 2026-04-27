import { countSlotsForEntries, mapDbEntryToManagerEntry } from "@/lib/queue/mappers";
import { is2Stay2OffRotation } from "@/lib/rotation-policy";

import type { CourtAssignmentInsert, DbClient, QueueEntryWithUser } from "@/lib/queue/types";
import type { RotationType } from "@/lib/types";
import type { Database } from "@/supabase/supa-schema";

export { loadStayingMappedForCourt } from "./load-staying-mapped-for-court";

export type ManagerEntry = ReturnType<typeof mapDbEntryToManagerEntry>;

export type AssignPlayersFail = { success: false; error: string };

export type EventRow = Database["public"]["Tables"]["events"]["Row"];

export type CourtPendingStayerRow =
  Database["public"]["Tables"]["court_pending_stayers"]["Row"] | null;

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
): Promise<AssignPlayersFail | { success: true; waitingQueue: ManagerEntry[] }> {
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

function orderedPlayers2Stay2OffDoubles(
  stayingMapped: ManagerEntry[],
  newFromQueue: ManagerEntry[],
): ManagerEntry[] | null {
  if (
    stayingMapped.length === 2 &&
    newFromQueue.length === 2 &&
    countSlotsForEntries(stayingMapped) === 2 &&
    countSlotsForEntries(newFromQueue) === 2
  ) {
    return [
      stayingMapped[0],
      newFromQueue[0],
      stayingMapped[1],
      newFromQueue[1],
    ];
  }
  return null;
}

export function resolveNextPlayersForCourt(
  params: ResolveNextPlayersParams,
): AssignPlayersFail | { success: true; nextPlayers: ManagerEntry[] } {
  const { event, rotationType, stayingMapped, newFromQueue, playersPerCourt } =
    params;
  let nextPlayers: ManagerEntry[] = [...stayingMapped, ...newFromQueue];
  if (is2Stay2OffRotation(rotationType) && event.team_size === 2) {
    const reordered = orderedPlayers2Stay2OffDoubles(stayingMapped, newFromQueue);
    if (reordered) nextPlayers = reordered;
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

export type PlayerSlot = {
  userId: string;
  name: string;
  skillLevel: string;
};

function pushNamedPlayerSlots(
  entry: ManagerEntry,
  groupSize: number,
  playerNames: Array<{ name: string; skillLevel: string }>,
  playerSlots: PlayerSlot[],
) {
  for (let i = 0; i < groupSize; i++) {
    playerSlots.push({
      userId: entry.userId,
      name: playerNames[i]?.name || entry.user?.name || "Player",
      skillLevel:
        playerNames[i]?.skillLevel ||
        entry.user?.skillLevel ||
        "intermediate",
    });
  }
}

function pushAnonymousPlayerSlots(
  entry: ManagerEntry,
  groupSize: number,
  playerSlots: PlayerSlot[],
) {
  for (let i = 0; i < groupSize; i++) {
    playerSlots.push({
      userId: entry.userId,
      name: entry.user?.name || "Player",
      skillLevel: entry.user?.skillLevel || "intermediate",
    });
  }
}

export function expandNextPlayersToPlayerSlots(
  nextPlayers: ManagerEntry[],
): PlayerSlot[] {
  const playerSlots: PlayerSlot[] = [];

  for (const entry of nextPlayers) {
    const groupSize = entry.groupSize || 1;
    const playerNames = entry.player_names || [];
    if (playerNames.length > 0) {
      pushNamedPlayerSlots(entry, groupSize, playerNames, playerSlots);
    } else {
      pushAnonymousPlayerSlots(entry, groupSize, playerSlots);
    }
  }

  return playerSlots;
}

export function buildCourtAssignmentInsert(
  eventId: string,
  courtNumber: number,
  nextPlayers: ManagerEntry[],
  playerSlots: PlayerSlot[],
): CourtAssignmentInsert {
  const assignmentData: CourtAssignmentInsert = {
    event_id: eventId,
    court_number: courtNumber,
    started_at: new Date().toISOString(),
    player_names: playerSlots.map((p) => p.name),
    queue_entry_ids: nextPlayers.map((p) => p.id),
  };

  if (playerSlots[0]) assignmentData.player1_id = playerSlots[0].userId;
  if (playerSlots[1]) assignmentData.player2_id = playerSlots[1].userId;
  if (playerSlots[2]) assignmentData.player3_id = playerSlots[2].userId;
  if (playerSlots[3]) assignmentData.player4_id = playerSlots[3].userId;
  if (playerSlots[4]) assignmentData.player5_id = playerSlots[4].userId;
  if (playerSlots[5]) assignmentData.player6_id = playerSlots[5].userId;
  if (playerSlots[6]) assignmentData.player7_id = playerSlots[6].userId;
  if (playerSlots[7]) assignmentData.player8_id = playerSlots[7].userId;

  return assignmentData;
}
