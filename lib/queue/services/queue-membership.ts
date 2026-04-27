import { is2Stay2OffRotation } from "@/lib/rotation-policy";
import { removeQueueEntryIdsFromCourtPendingStayers } from "@/lib/queue/pending-stayers";
import {
  runQueueMaintenance,
  runQueueMaintenanceWithPreReorder,
} from "@/lib/queue/services/maintenance";
import { createClient } from "@/lib/supabase/server";

import { sendQueueNotification } from "@/app/actions/notifications";

import type { RotationType } from "@/lib/types";

type QueueNotification = {
  userId: string;
  eventId: string;
  position: number;
  notificationType: "up-next" | "position-update" | "court-assignment";
  courtNumber?: number;
};

type FlushQueueNotifications = (notifications: QueueNotification[]) => Promise<void>;

type MembershipDeps = {
  flushQueueNotifications: FlushQueueNotifications;
};

export async function joinQueueService(
  eventId: string,
  userId: string,
  groupSize: number,
  groupId: string | undefined,
  playerNames: Array<{ name: string; skillLevel: string }> | undefined,
  deps: MembershipDeps,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return { error: "Not authenticated" as const };
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
      } as const;
    }
    if (groupId) {
      return {
        error: "2 Stay 2 Off only allows solo queue entries (no groups).",
      } as const;
    }
    if (groupSize !== 1) {
      return {
        error: "2 Stay 2 Off only allows solo queue entries.",
      } as const;
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
    return { error: error.message } as const;
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
    flushQueueNotifications: deps.flushQueueNotifications,
  });

  await sendQueueNotification(userId, eventId, position, "join").catch((err) =>
    console.error("Failed to send join email:", err),
  );

  return { data, error: null };
}

export async function leaveQueueService(
  queueEntryId: string,
  deps: MembershipDeps,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" as const };
  }

  const { data: entry } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("id", queueEntryId)
    .single();

  if (!entry || entry.user_id !== user.id) {
    return { error: "Unauthorized" as const };
  }

  const { error } = await supabase
    .from("queue_entries")
    .delete()
    .eq("id", queueEntryId);

  if (error) {
    console.error("Error leaving queue:", error);
    return { error: error.message } as const;
  }

  await removeQueueEntryIdsFromCourtPendingStayers(supabase, entry.event_id, [
    queueEntryId,
  ]);

  await runQueueMaintenanceWithPreReorder(entry.event_id, {
    flushQueueNotifications: deps.flushQueueNotifications,
  });

  return { error: null, eventId: entry.event_id };
}

export async function adminRemoveFromQueueService(
  queueEntryId: string,
  deps: MembershipDeps,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user) {
    if (authError) {
      console.error("Failed to authenticate admin user:", authError);
    }
    return { error: "Not authenticated" as const };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Admin profile lookup failed:", profileError);
    return { error: `Profile error: ${profileError.message}` } as const;
  }

  if (!profile?.is_admin) {
    return { error: "Unauthorized - Admin access required" } as const;
  }

  const { data: entry, error: entryError } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("id", queueEntryId)
    .single();

  if (entryError) {
    console.error("Queue entry lookup failed:", entryError);
    return { error: `Queue entry error: ${entryError.message}` } as const;
  }

  if (!entry) {
    return { error: "Queue entry not found" } as const;
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
      return { error: groupSelectError.message } as const;
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
      return { error: groupError.message } as const;
    }
  } else {
    const { error } = await supabase
      .from("queue_entries")
      .delete()
      .eq("id", queueEntryId);

    if (error) {
      console.error("Failed to remove queue entry:", error);
      return { error: error.message } as const;
    }
  }

  await removeQueueEntryIdsFromCourtPendingStayers(supabase, eventId, idsToPrune);

  await runQueueMaintenanceWithPreReorder(entry.event_id, {
    flushQueueNotifications: deps.flushQueueNotifications,
  });

  return { error: null, eventId: entry.event_id };
}
