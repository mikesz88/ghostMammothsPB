import { countSlotsForEntries } from "@/lib/queue/mappers";
import { reconcilePendingSoloForEvent } from "@/lib/queue/pending-solo";
import {
  buildCourtAssignmentInsert,
  deleteStaleEndedAssignmentsOnCourt,
  expandNextPlayersToPlayerSlots,
  fetchEventForCourtAssignment,
  loadStayingMappedForCourt,
  loadWaitingQueueMapped,
  resolveFirstAvailableCourtNumber,
  resolveNextPlayersForCourt,
  type ManagerEntry,
} from "@/lib/queue/services/court-assignment-helpers";
import { reorderQueue } from "@/lib/queue/services/queue-ordering";
import { createClient } from "@/lib/supabase/server";

import type { RotationType } from "@/lib/types";

type QueueNotification = {
  userId: string;
  eventId: string;
  position: number;
  notificationType: "up-next" | "position-update" | "court-assignment";
  courtNumber?: number;
};

type FlushQueueNotifications = (notifications: QueueNotification[]) => Promise<void>;

export async function assignPlayersToNextCourt(
  eventId: string,
  flushQueueNotifications: FlushQueueNotifications,
) {
  const supabase = await createClient();

  const eventResult = await fetchEventForCourtAssignment(supabase, eventId);
  if (!eventResult.success) {
    return eventResult;
  }
  const { event } = eventResult;

  const playersPerCourt = event.team_size * 2;

  const courtPick = await resolveFirstAvailableCourtNumber(
    supabase,
    eventId,
    event.court_count,
  );
  if (!courtPick.success) {
    return courtPick;
  }
  const availableCourt = courtPick.courtNumber;

  await deleteStaleEndedAssignmentsOnCourt(supabase, eventId, availableCourt);

  const { QueueManager } = await import("@/lib/queue-manager");

  const stayResult = await loadStayingMappedForCourt(
    supabase,
    eventId,
    availableCourt,
    playersPerCourt,
  );
  if (!stayResult.success) {
    return stayResult;
  }
  const { stayingMapped, pendingRow } = stayResult;

  const rotationType = event.rotation_type as RotationType;

  const stayingCount = countSlotsForEntries(stayingMapped);
  const playersNeeded = playersPerCourt - stayingCount;

  if (playersNeeded < 0) {
    return {
      success: false,
      error: "Invalid pending stayer count for this court.",
    };
  }

  const waitResult = await loadWaitingQueueMapped(supabase, eventId);
  if (!waitResult.success) {
    return waitResult;
  }
  const { waitingQueue } = waitResult;

  let newFromQueue: ManagerEntry[] = [];
  if (playersNeeded > 0) {
    newFromQueue = QueueManager.getNextPlayers(
      waitingQueue,
      playersNeeded,
    ) as ManagerEntry[];
    const got = countSlotsForEntries(newFromQueue);
    if (got < playersNeeded) {
      return {
        success: false,
        error: `Not enough players in queue. Need ${playersNeeded} more player slot(s) to fill the court.`,
      };
    }
  } else if (playersNeeded === 0 && stayingCount !== playersPerCourt) {
    return {
      success: false,
      error: "Pending stayers do not fill the court.",
    };
  }

  const nextResult = resolveNextPlayersForCourt(
    event,
    rotationType,
    stayingMapped,
    newFromQueue,
    playersPerCourt,
  );
  if (!nextResult.success) {
    return nextResult;
  }
  const { nextPlayers } = nextResult;

  const playerSlots = expandNextPlayersToPlayerSlots(nextPlayers);
  const assignmentData = buildCourtAssignmentInsert(
    eventId,
    availableCourt,
    nextPlayers,
    playerSlots,
  );

  const { error: assignmentError } = await supabase
    .from("court_assignments")
    .insert(assignmentData);

  if (assignmentError) {
    console.error("Error creating assignment:", assignmentError);
    return {
      success: false,
      error: `Failed to assign players: ${assignmentError.message}`,
    };
  }

  if (pendingRow && stayingMapped.length > 0) {
    await supabase
      .from("court_pending_stayers")
      .delete()
      .eq("event_id", eventId)
      .eq("court_number", availableCourt);
  }

  for (const player of nextPlayers) {
    const { error: updateError } = await supabase
      .from("queue_entries")
      .update({ status: "playing" })
      .eq("id", player.id);

    if (updateError) {
      console.error(`Failed to update player ${player.id}:`, updateError);
    }
  }

  await flushQueueNotifications(
    nextPlayers.map((player) => ({
      userId: player.userId,
      eventId,
      position: player.position,
      notificationType: "court-assignment" as const,
      courtNumber: availableCourt,
    })),
  ).catch((err) =>
    console.error("Failed to send court assignment emails:", err),
  );

  await reconcilePendingSoloForEvent(eventId);
  await reorderQueue(eventId, { flushQueueNotifications });

  return {
    success: true,
    courtNumber: availableCourt,
    playersAssigned: playersPerCourt,
  };
}
