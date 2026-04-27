import { isWinnersStayStyleRotation } from "@/lib/rotation-policy";

import type { RotationType } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

async function setQueueEntryWaiting(db: SupabaseClient, entryId: string) {
  await db.from("queue_entries").update({ status: "waiting" }).eq("id", entryId);
}

async function setQueueEntryPendingStay(db: SupabaseClient, entryId: string) {
  await db.from("queue_entries").update({ status: "pending_stay" }).eq("id", entryId);
}

export async function markCourtAssignmentEnded(
  db: SupabaseClient,
  assignmentId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const { error: endErr } = await db
    .from("court_assignments")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", assignmentId);
  if (endErr) {
    console.error("Error ending game:", endErr);
    return { success: false, error: "Failed to end game" };
  }
  return { success: true };
}

export async function deleteCourtPendingStayersOnCourt(
  db: SupabaseClient,
  eventId: string,
  courtNumber: number,
) {
  await db
    .from("court_pending_stayers")
    .delete()
    .eq("event_id", eventId)
    .eq("court_number", courtNumber);
}

export async function applyQueueEntryStatusesAfterEnd(
  db: SupabaseClient,
  queueEntryIds: string[],
  winnerEntryIds: Set<string>,
  rotationType: RotationType,
) {
  for (const entryId of queueEntryIds) {
    const isWinner = winnerEntryIds.has(entryId);
    if (!isWinnersStayStyleRotation(rotationType)) {
      await setQueueEntryWaiting(db, entryId);
      continue;
    }
    if (isWinner) await setQueueEntryPendingStay(db, entryId);
    else await setQueueEntryWaiting(db, entryId);
  }
}
