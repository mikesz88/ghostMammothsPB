import { courtAssignmentIncludesUser } from "@/lib/events/court-assignment-utils";

import type { CourtAssignment, Event, QueueEntry } from "@/lib/types";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export function deriveUserQueueFields(
  queue: QueueEntry[],
  user: SupabaseAuthUser | null,
) {
  const currentUserEntry = queue.find(
    (e) =>
      e.userId === user?.id &&
      (e.status === "waiting" ||
        e.status === "pending_solo" ||
        e.status === "pending_stay"),
  );
  const userPosition = currentUserEntry?.position || 0;
  const isPendingSolo = currentUserEntry?.status === "pending_solo";
  const isPendingStay = currentUserEntry?.status === "pending_stay";
  const isUpNext =
    !isPendingSolo && !isPendingStay && userPosition > 0 && userPosition <= 4;
  return { userPosition, isPendingSolo, isPendingStay, isUpNext };
}

export function derivePlayingAndCounts(
  user: SupabaseAuthUser | null,
  assignments: CourtAssignment[],
  queue: QueueEntry[],
  event: Event,
) {
  const isCurrentlyPlaying = Boolean(
    user &&
      assignments.some(
        (assignment) =>
          !assignment.endedAt && courtAssignmentIncludesUser(assignment, user.id),
      ),
  );
  const waitingCount = queue.filter(
    (e) =>
      e.status === "waiting" ||
      e.status === "pending_solo" ||
      e.status === "pending_stay",
  ).length;
  const playingCount =
    assignments.filter((a) => !a.endedAt).length * event.teamSize * 2;
  return { isCurrentlyPlaying, waitingCount, playingCount };
}
