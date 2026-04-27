import { removeQueueEntryIdsFromCourtPendingStayers } from "@/lib/queue/pending-stayers";
import { runQueueMaintenanceWithPreReorder } from "@/lib/queue/services/maintenance";
import { createClient } from "@/lib/supabase/server";

import type { MembershipDeps } from "@/lib/queue/services/queue-membership-types";

async function requireQueueAdminUser(supabase: Awaited<ReturnType<typeof createClient>>) {
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
    return { error: `Profile error: ${profileError.message}` as const };
  }

  if (!profile?.is_admin) {
    return { error: "Unauthorized - Admin access required" as const };
  }

  return { user };
}

async function loadQueueEntryForAdminRemove(
  supabase: Awaited<ReturnType<typeof createClient>>,
  queueEntryId: string,
) {
  const { data: entry, error: entryError } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("id", queueEntryId)
    .single();

  if (entryError) {
    console.error("Queue entry lookup failed:", entryError);
    return { error: `Queue entry error: ${entryError.message}` as const };
  }
  if (!entry) {
    return { error: "Queue entry not found" as const };
  }
  return { entry };
}

async function collectIdsToPruneForRemove(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entry: { id: string; group_id: string | null },
) {
  let idsToPrune: string[] = [entry.id];
  if (!entry.group_id) return { idsToPrune };

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
  return { idsToPrune };
}

async function deleteGroupByGroupId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  groupId: string,
) {
  const { error: groupError } = await supabase
    .from("queue_entries")
    .delete()
    .eq("group_id", groupId);
  if (groupError) {
    console.error("Failed to remove queue group entries:", groupError);
    return { error: groupError.message };
  }
  return { error: null as null };
}

async function deleteQueueEntrySolo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  queueEntryId: string,
) {
  const { error } = await supabase.from("queue_entries").delete().eq("id", queueEntryId);
  if (error) {
    console.error("Failed to remove queue entry:", error);
    return { error: error.message };
  }
  return { error: null as null };
}

async function deleteQueueRowsForAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  queueEntryId: string,
  entry: { group_id: string | null },
) {
  if (entry.group_id) {
    return deleteGroupByGroupId(supabase, entry.group_id);
  }
  return deleteQueueEntrySolo(supabase, queueEntryId);
}

async function finalizeAdminQueueAfterDelete(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entry: { event_id: string },
  idsToPrune: string[],
  deps: MembershipDeps,
) {
  await removeQueueEntryIdsFromCourtPendingStayers(supabase, entry.event_id, idsToPrune);
  await runQueueMaintenanceWithPreReorder(entry.event_id, {
    flushQueueNotifications: deps.flushQueueNotifications,
  });
}

export async function adminRemoveFromQueueService(
  queueEntryId: string,
  deps: MembershipDeps,
) {
  const supabase = await createClient();
  const admin = await requireQueueAdminUser(supabase);
  if ("error" in admin) return { error: admin.error };

  const loaded = await loadQueueEntryForAdminRemove(supabase, queueEntryId);
  if ("error" in loaded) return { error: loaded.error };
  const { entry } = loaded;

  const idsResult = await collectIdsToPruneForRemove(supabase, entry);
  if ("error" in idsResult) return { error: idsResult.error };

  const del = await deleteQueueRowsForAdmin(supabase, queueEntryId, entry);
  if (del.error !== null) return { error: del.error };

  await finalizeAdminQueueAfterDelete(supabase, entry, idsResult.idsToPrune, deps);
  return { error: null, eventId: entry.event_id };
}
