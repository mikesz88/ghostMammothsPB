import type { DbClient } from "@/lib/queue/types";

async function prunePendingStayerRow(
  supabase: DbClient,
  row: { id: string; queue_entry_ids: unknown },
  removeSet: Set<string>,
) {
  const raw = row.queue_entry_ids;
  if (!Array.isArray(raw)) return;
  const ids = raw as string[];
  const filtered = ids.filter((id) => !removeSet.has(id));
  if (filtered.length === ids.length) return;

  if (filtered.length === 0) {
    const { error: delErr } = await supabase
      .from("court_pending_stayers")
      .delete()
      .eq("id", row.id);
    if (delErr) console.error("Failed to delete empty court_pending_stayers:", delErr);
    return;
  }
  const { error: upErr } = await supabase
    .from("court_pending_stayers")
    .update({ queue_entry_ids: filtered })
    .eq("id", row.id);
  if (upErr) console.error("Failed to update court_pending_stayers ids:", upErr);
}

/** Drop removed queue entry ids from winners-on-deck rows (avoids ghost UUIDs after leave/admin remove). */
export async function removeQueueEntryIdsFromCourtPendingStayers(
  supabase: DbClient,
  eventId: string,
  entryIdsToRemove: string[],
) {
  if (entryIdsToRemove.length === 0) return;
  const removeSet = new Set(entryIdsToRemove);

  const { data: rows, error } = await supabase
    .from("court_pending_stayers")
    .select("id, queue_entry_ids")
    .eq("event_id", eventId);

  if (error) {
    console.error("Failed to load court_pending_stayers for prune:", error);
    return;
  }

  for (const row of rows || []) {
    await prunePendingStayerRow(supabase, row, removeSet);
  }
}
