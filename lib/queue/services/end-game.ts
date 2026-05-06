import { reconcilePendingSoloForEvent } from "@/lib/queue/pending-solo";
import {
  applyQueueEntryStatusesAfterEnd,
  deleteCourtPendingStayersOnCourt,
  markCourtAssignmentEnded,
} from "@/lib/queue/services/end-game-persist";
import { resequenceWaitingAfterEndGame } from "@/lib/queue/services/end-game-resequence";
import {
  hydrateEndGameQueueState,
  loadEndGameAuthSlice,
  loadWaitingQueueRows,
} from "@/lib/queue/services/end-game-setup";
import { reorderQueue } from "@/lib/queue/services/queue-ordering";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

import type { EndGameAuthSlice, EndGameHydrated } from "@/lib/queue/services/end-game-setup";
import type { SupabaseClient } from "@supabase/supabase-js";

type QueueNotification = {
  userId: string;
  eventId: string;
  position: number;
  notificationType: "up-next" | "position-update" | "court-assignment";
  courtNumber?: number;
};

type FlushQueueNotifications = (notifications: QueueNotification[]) => Promise<void>;

type EndGameUiSlice = Extract<EndGameAuthSlice, { success: true }>;

type ResequenceNotifyParams = {
  db: SupabaseClient;
  eventId: string;
  winningTeam: "team1" | "team2";
  authSlice: EndGameUiSlice;
  hydrated: EndGameHydrated;
  flushQueueNotifications: FlushQueueNotifications;
};

async function resequenceCourtAndReorderNotifications(p: ResequenceNotifyParams) {
  const allWaiting = await loadWaitingQueueRows(p.db, p.eventId);
  await resequenceWaitingAfterEndGame({
    db: p.db,
    eventId: p.eventId,
    rotationType: p.authSlice.rotationType,
    teamSize: p.authSlice.teamSize,
    winningTeam: p.winningTeam,
    courtNumber: p.authSlice.courtNumber,
    queueEntryIds: p.hydrated.queueEntryIds,
    entriesById: p.hydrated.entriesById,
    ar: p.authSlice.ar,
    allWaiting,
  });
  await reconcilePendingSoloForEvent(p.eventId, p.db);
  await reorderQueue(p.eventId, { db: p.db, flushQueueNotifications: p.flushQueueNotifications });
}

type PersistAfterEndParams = ResequenceNotifyParams & {
  assignmentId: string;
};

async function persistAndResequenceAfterEnd(p: PersistAfterEndParams) {
  const ended = await markCourtAssignmentEnded(p.db, p.assignmentId);
  if (!ended.success) return ended;
  await deleteCourtPendingStayersOnCourt(p.db, p.eventId, p.authSlice.courtNumber);
  await applyQueueEntryStatusesAfterEnd(
    p.db,
    p.hydrated.queueEntryIds,
    p.hydrated.winnerEntryIds,
    p.authSlice.rotationType,
  );
  await resequenceCourtAndReorderNotifications(p);
  return { success: true as const };
}

export async function endGameAndReorderQueue(
  eventId: string,
  assignmentId: string,
  winningTeam: "team1" | "team2",
  flushQueueNotifications: FlushQueueNotifications,
) {
  const supabase = await createClient();
  const authSlice = await loadEndGameAuthSlice(supabase, eventId, assignmentId);
  if (!authSlice.success) return authSlice;

  const db = createServiceRoleClient();
  if (!db) {
    console.error("endGameAndReorderQueue: SUPABASE_SERVICE_ROLE_KEY missing");
    return { success: false, error: "Server configuration error" };
  }

  const hydrated = await hydrateEndGameQueueState(db, eventId, winningTeam, authSlice);
  return persistAndResequenceAfterEnd({
    db,
    eventId,
    assignmentId,
    winningTeam,
    authSlice,
    hydrated,
    flushQueueNotifications,
  });
}
