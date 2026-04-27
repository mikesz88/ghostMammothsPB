"use server";

import { revalidatePath } from "next/cache";

import { is2Stay2OffRotation } from "@/lib/rotation-policy";
import { reconcilePendingSoloForEvent } from "@/lib/queue/pending-solo";
import { removeQueueEntryIdsFromCourtPendingStayers } from "@/lib/queue/pending-stayers";
import { assignPlayersToNextCourt as assignPlayersToNextCourtService } from "@/lib/queue/services/court-assignment";
import { endGameAndReorderQueue as endGameAndReorderQueueService } from "@/lib/queue/services/end-game";
import { runQueueMaintenance, runQueueMaintenanceWithPreReorder } from "@/lib/queue/services/maintenance";
import { reorderQueue as reorderQueueService } from "@/lib/queue/services/queue-ordering";
import { createClient } from "@/lib/supabase/server";

import {
  flushQueueEmailNotifications,
  sendQueueNotification,
} from "./notifications";

import type { DbClient } from "@/lib/queue/types";
import type { RotationType } from "@/lib/types";

export { reconcilePendingSoloForEvent };

export async function getQueue(eventId: string) {
  const supabase = await createClient();

  const { data: queue, error } = await supabase
    .from("queue_entries")
    .select(
      `
      *,
      user:users(*)
    `,
    )
    .eq("event_id", eventId)
    .in("status", ["waiting", "pending_solo"])
    .order("position");

  if (error) {
    console.error("Error fetching queue:", error);
    return { queue: [], error };
  }

  return { queue: queue || [], error: null };
}

export async function joinQueue(
  eventId: string,
  userId: string,
  groupSize: number,
  groupId?: string,
  playerNames?: Array<{ name: string; skillLevel: string }>,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return { error: "Not authenticated" };
  }

  const { data: eventRow } = await supabase
    .from("events")
    .select("rotation_type, team_size")
    .eq("id", eventId)
    .single();

  const eventRotation = (eventRow?.rotation_type as RotationType) ?? "rotate-all";
  if (is2Stay2OffRotation(eventRotation)) {
    if ((eventRow?.team_size ?? 2) !== 2) {
      return {
        error:
          "2 Stay 2 Off is only available for doubles events (team size 2).",
      };
    }
    if (groupId) {
      return {
        error: "2 Stay 2 Off only allows solo queue entries (no groups).",
      };
    }
    if (groupSize !== 1) {
      return {
        error: "2 Stay 2 Off only allows solo queue entries.",
      };
    }
  }

  const { data: currentQueue } = await supabase
    .from("queue_entries")
    .select("position")
    .eq("event_id", eventId)
    .in("status", ["waiting", "pending_solo"])
    .order("position", { ascending: false })
    .limit(1);

  const position = currentQueue?.[0]?.position
    ? currentQueue[0].position + 1
    : 1;

  let insertStatus: "waiting" | "pending_solo" = "waiting";
  if (groupSize === 1) {
    const { count: existingSoloCount } = await supabase
      .from("queue_entries")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .in("status", ["waiting", "pending_solo"])
      .eq("group_size", 1);
    const n = existingSoloCount ?? 0;
    insertStatus = n >= 1 ? "waiting" : "pending_solo";
  }

  const { data, error } = await supabase
    .from("queue_entries")
    .insert({
      event_id: eventId,
      user_id: userId,
      group_id: groupId,
      group_size: groupSize,
      player_names: playerNames || [],
      position: position,
      status: insertStatus,
    })
    .select()
    .single();

  if (error) {
    console.error("Error joining queue:", error);
    return { error: error.message };
  }

  if (groupSize === 1 && insertStatus === "waiting") {
    await supabase
      .from("queue_entries")
      .update({ status: "waiting" })
      .eq("event_id", eventId)
      .eq("status", "pending_solo")
      .eq("group_size", 1);
  }

  await runQueueMaintenance(eventId, {
    flushQueueNotifications: flushQueueEmailNotifications,
  });

  // Send email notification (async, don't await to avoid blocking)
  await sendQueueNotification(userId, eventId, position, "join").catch((err) =>
    console.error("Failed to send join email:", err),
  );

  revalidatePath(`/events/${eventId}`);
  return { data, error: null };
}

export async function leaveQueue(queueEntryId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get the queue entry to verify ownership
  const { data: entry } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("id", queueEntryId)
    .single();

  if (!entry || entry.user_id !== user.id) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("queue_entries")
    .delete()
    .eq("id", queueEntryId);

  if (error) {
    console.error("Error leaving queue:", error);
    return { error: error.message };
  }

  await removeQueueEntryIdsFromCourtPendingStayers(supabase, entry.event_id, [
    queueEntryId,
  ]);

  // Reorder remaining queue positions
  await runQueueMaintenanceWithPreReorder(entry.event_id, {
    flushQueueNotifications: flushQueueEmailNotifications,
  });

  revalidatePath(`/events/${entry.event_id}`);
  return { error: null };
}

export async function reorderQueue(eventId: string, db?: DbClient) {
  return reorderQueueService(eventId, {
    db,
    flushQueueNotifications: flushQueueEmailNotifications,
  });
}

export async function endGameAndReorderQueue(
  eventId: string,
  assignmentId: string,
  winningTeam: "team1" | "team2",
) {
  const result = await endGameAndReorderQueueService(
    eventId,
    assignmentId,
    winningTeam,
    flushQueueEmailNotifications,
  );
  if (!result.success) {
    return result;
  }
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}`);
  return result;
}

export async function assignPlayersToNextCourt(eventId: string) {
  const result = await assignPlayersToNextCourtService(
    eventId,
    flushQueueEmailNotifications,
  );
  if (!result.success) {
    return result;
  }
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}`);
  return result;
}

export async function adminRemoveFromQueue(queueEntryId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user) {
    if (authError) {
      console.error("Failed to authenticate admin user:", authError);
    }
    return { error: "Not authenticated" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Admin profile lookup failed:", profileError);
    return { error: `Profile error: ${profileError.message}` };
  }

  if (!profile?.is_admin) {
    return { error: "Unauthorized - Admin access required" };
  }

  const { data: entry, error: entryError } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("id", queueEntryId)
    .single();

  if (entryError) {
    console.error("Queue entry lookup failed:", entryError);
    return { error: `Queue entry error: ${entryError.message}` };
  }

  if (!entry) {
    return { error: "Queue entry not found" };
  }

  const eventId = entry.event_id;
  let idsToPrune: string[] = [entry.id];
  if (entry.group_id) {
    const { data: groupRows, error: groupSelectError } = await supabase
      .from("queue_entries")
      .select("id")
      .eq("group_id", entry.group_id);
    if (groupSelectError) {
      console.error("Failed to list group queue entries:", groupSelectError);
      return { error: groupSelectError.message };
    }
    if (groupRows?.length) {
      idsToPrune = groupRows.map((r) => r.id);
    }
  }

  if (entry.group_id) {
    const { error: groupError } = await supabase
      .from("queue_entries")
      .delete()
      .eq("group_id", entry.group_id);

    if (groupError) {
      console.error("Failed to remove queue group entries:", groupError);
      return { error: groupError.message };
    }
  } else {
    const { error } = await supabase
      .from("queue_entries")
      .delete()
      .eq("id", queueEntryId);

    if (error) {
      console.error("Failed to remove queue entry:", error);
      return { error: error.message };
    }
  }

  await removeQueueEntryIdsFromCourtPendingStayers(supabase, eventId, idsToPrune);

  await runQueueMaintenanceWithPreReorder(entry.event_id, {
    flushQueueNotifications: flushQueueEmailNotifications,
  });

  revalidatePath(`/events/${entry.event_id}`);
  revalidatePath(`/admin/events/${entry.event_id}`);

  return { error: null };
}
