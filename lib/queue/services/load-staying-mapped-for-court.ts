import { countSlotsForEntries, mapDbEntryToManagerEntry } from "@/lib/queue/mappers";

import type { DbClient, QueueEntryWithUser } from "@/lib/queue/types";
import type { Database } from "@/supabase/supa-schema";

type ManagerEntry = ReturnType<typeof mapDbEntryToManagerEntry>;
type CourtPendingStayerRow =
  Database["public"]["Tables"]["court_pending_stayers"]["Row"] | null;

type LoadStayingFail = { success: false; error: string };
type LoadStayingOk = {
  success: true;
  stayingMapped: ManagerEntry[];
  pendingRow: CourtPendingStayerRow;
};

const QUEUE_ENTRY_WITH_USER =
  "*, user:users(id, name, email, skill_level)" as const;

async function fetchPendingStayerRow(
  supabase: DbClient,
  eventId: string,
  availableCourt: number,
) {
  const { data: pendingRow } = await supabase
    .from("court_pending_stayers")
    .select("*")
    .eq("event_id", eventId)
    .eq("court_number", availableCourt)
    .maybeSingle();
  return pendingRow as CourtPendingStayerRow;
}

function stayUserRowsOrdered(
  stayRows: QueueEntryWithUser[] | null | undefined,
  ids: string[],
): QueueEntryWithUser[] {
  const byId = new Map((stayRows || []).map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter((r): r is QueueEntryWithUser => Boolean(r));
}

async function mapStayingByPendingOrder(
  supabase: DbClient,
  eventId: string,
  availableCourt: number,
  ids: string[],
): Promise<{ error: string } | { ordered: QueueEntryWithUser[] }> {
  const { data: stayRows, error: stayErr } = await supabase
    .from("queue_entries")
    .select(QUEUE_ENTRY_WITH_USER)
    .in("id", ids);
  if (stayErr) return { error: "Failed to load pending stayers" };
  const ordered = stayUserRowsOrdered((stayRows || []) as QueueEntryWithUser[], ids);
  if (ordered.length === 0) {
    await supabase
      .from("court_pending_stayers")
      .delete()
      .eq("event_id", eventId)
      .eq("court_number", availableCourt);
  }
  return { ordered };
}

function stayingOkFromOrderedRows(
  ordered: QueueEntryWithUser[],
  pendingRow: CourtPendingStayerRow,
  playersPerCourt: number,
): LoadStayingFail | LoadStayingOk {
  if (ordered.length === 0) {
    return { success: true, stayingMapped: [], pendingRow };
  }
  const mappedEntries = ordered.map(mapDbEntryToManagerEntry);
  if (countSlotsForEntries(mappedEntries) > playersPerCourt) {
    return { success: false, error: "Pending stayers exceed court capacity." };
  }
  return { success: true, stayingMapped: mappedEntries, pendingRow };
}

export async function loadStayingMappedForCourt(
  supabase: DbClient,
  eventId: string,
  availableCourt: number,
  playersPerCourt: number,
): Promise<LoadStayingFail | LoadStayingOk> {
  const pendingRow = await fetchPendingStayerRow(supabase, eventId, availableCourt);
  const stayingMapped: ManagerEntry[] = [];
  const pendingIds = pendingRow?.queue_entry_ids;
  if (!pendingRow || !Array.isArray(pendingIds) || (pendingIds as string[]).length === 0) {
    return { success: true, stayingMapped, pendingRow };
  }
  const mapped = await mapStayingByPendingOrder(
    supabase,
    eventId,
    availableCourt,
    pendingIds as string[],
  );
  if ("error" in mapped) return { success: false, error: mapped.error };
  return stayingOkFromOrderedRows(mapped.ordered, pendingRow, playersPerCourt);
}
