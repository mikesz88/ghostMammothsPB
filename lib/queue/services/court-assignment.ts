import { is2Stay2OffRotation } from "@/lib/rotation-policy";
import { countSlotsForEntries, mapDbEntryToManagerEntry } from "@/lib/queue/mappers";
import { reconcilePendingSoloForEvent } from "@/lib/queue/pending-solo";
import { reorderQueue } from "@/lib/queue/services/queue-ordering";
import { createClient } from "@/lib/supabase/server";

import type { CourtAssignmentInsert, QueueEntryWithUser } from "@/lib/queue/types";
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

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { success: false, error: "Event not found" };
  }

  const playersPerCourt = event.team_size * 2;

  const { data: activeAssignments } = await supabase
    .from("court_assignments")
    .select("court_number")
    .eq("event_id", eventId)
    .is("ended_at", null);

  const activeCourts = new Set(
    activeAssignments?.map((a) => a.court_number) || [],
  );

  let availableCourt: number | null = null;
  for (let i = 1; i <= event.court_count; i++) {
    if (!activeCourts.has(i)) {
      availableCourt = i;
      break;
    }
  }

  if (availableCourt === null) {
    return { success: false, error: "No available courts" };
  }

  await supabase
    .from("court_assignments")
    .delete()
    .eq("event_id", eventId)
    .eq("court_number", availableCourt)
    .not("ended_at", "is", null);

  const { QueueManager } = await import("@/lib/queue-manager");

  const { data: pendingRow } = await supabase
    .from("court_pending_stayers")
    .select("*")
    .eq("event_id", eventId)
    .eq("court_number", availableCourt)
    .maybeSingle();

  let stayingMapped: ReturnType<typeof mapDbEntryToManagerEntry>[] = [];

  const pendingIds = pendingRow?.queue_entry_ids;
  if (
    pendingRow &&
    Array.isArray(pendingIds) &&
    (pendingIds as string[]).length > 0
  ) {
    const ids = pendingIds as string[];
    const { data: stayRows, error: stayErr } = await supabase
      .from("queue_entries")
      .select(
        `
        *,
        user:users(id, name, email, skill_level)
      `,
      )
      .in("id", ids);

    if (stayErr) {
      return { success: false, error: "Failed to load pending stayers" };
    }

    const byId = new Map(
      (stayRows || []).map((r) => [r.id, r as QueueEntryWithUser]),
    );
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((r): r is QueueEntryWithUser => Boolean(r));

    if (ordered.length === 0) {
      await supabase
        .from("court_pending_stayers")
        .delete()
        .eq("event_id", eventId)
        .eq("court_number", availableCourt);
    } else {
      stayingMapped = ordered.map(mapDbEntryToManagerEntry);
      const sc = countSlotsForEntries(stayingMapped);
      if (sc > playersPerCourt) {
        return {
          success: false,
          error: "Pending stayers exceed court capacity.",
        };
      }
    }
  }

  const rotationType = event.rotation_type as RotationType;

  const stayingCount = countSlotsForEntries(stayingMapped);
  const playersNeeded = playersPerCourt - stayingCount;

  if (playersNeeded < 0) {
    return {
      success: false,
      error: "Invalid pending stayer count for this court.",
    };
  }

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

  let newFromQueue: ReturnType<typeof mapDbEntryToManagerEntry>[] = [];
  if (playersNeeded > 0) {
    newFromQueue = QueueManager.getNextPlayers(
      waitingQueue,
      playersNeeded,
    ) as ReturnType<typeof mapDbEntryToManagerEntry>[];
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

  let nextPlayers: ReturnType<typeof mapDbEntryToManagerEntry>[] = [
    ...stayingMapped,
    ...newFromQueue,
  ];
  if (
    is2Stay2OffRotation(rotationType) &&
    event.team_size === 2 &&
    stayingMapped.length === 2 &&
    newFromQueue.length === 2 &&
    countSlotsForEntries(stayingMapped) === 2 &&
    countSlotsForEntries(newFromQueue) === 2
  ) {
    nextPlayers = [
      stayingMapped[0],
      newFromQueue[0],
      stayingMapped[1],
      newFromQueue[1],
    ];
  }

  const totalSlots = countSlotsForEntries(nextPlayers);
  if (totalSlots !== playersPerCourt) {
    return {
      success: false,
      error: "Could not form a full court from queue and pending stayers.",
    };
  }

  const assignmentData: CourtAssignmentInsert = {
    event_id: eventId,
    court_number: availableCourt,
    started_at: new Date().toISOString(),
    player_names: [],
    queue_entry_ids: nextPlayers.map((p) => p.id),
  };

  const playerSlots: Array<{
    userId: string;
    name: string;
    skillLevel: string;
  }> = [];

  for (const entry of nextPlayers) {
    const groupSize = entry.groupSize || 1;
    const playerNames = entry.player_names || [];

    if (playerNames.length > 0) {
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
    } else {
      for (let i = 0; i < groupSize; i++) {
        playerSlots.push({
          userId: entry.userId,
          name: entry.user?.name || "Player",
          skillLevel: entry.user?.skillLevel || "intermediate",
        });
      }
    }
  }

  assignmentData.player_names = playerSlots.map((p) => p.name);

  if (playerSlots[0]) assignmentData.player1_id = playerSlots[0].userId;
  if (playerSlots[1]) assignmentData.player2_id = playerSlots[1].userId;
  if (playerSlots[2]) assignmentData.player3_id = playerSlots[2].userId;
  if (playerSlots[3]) assignmentData.player4_id = playerSlots[3].userId;
  if (playerSlots[4]) assignmentData.player5_id = playerSlots[4].userId;
  if (playerSlots[5]) assignmentData.player6_id = playerSlots[5].userId;
  if (playerSlots[6]) assignmentData.player7_id = playerSlots[6].userId;
  if (playerSlots[7]) assignmentData.player8_id = playerSlots[7].userId;

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
