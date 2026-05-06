import { removeQueueEntryIdsFromCourtPendingStayers } from "@/lib/queue/pending-stayers";
import { runQueueMaintenanceWithPreReorder } from "@/lib/queue/services/maintenance";
import { createClient } from "@/lib/supabase/server";

import type { MembershipDeps } from "@/lib/queue/services/queue-membership-types";

async function loadOwnedQueueEntry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  queueEntryId: string,
  userId: string,
) {
  const { data: entry } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("id", queueEntryId)
    .single();
  if (!entry || entry.user_id !== userId) {
    return { ok: false as const, error: "Unauthorized" as const };
  }
  return { ok: true as const, entry };
}

export async function leaveQueueService(
  queueEntryId: string,
  deps: MembershipDeps,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" as const };

  const loaded = await loadOwnedQueueEntry(supabase, queueEntryId, user.id);
  if (!loaded.ok) return { error: loaded.error };
  const { entry } = loaded;

  const { error } = await supabase.from("queue_entries").delete().eq("id", queueEntryId);
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
