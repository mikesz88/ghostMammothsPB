import { createClient } from "@/lib/supabase/server";

import { commitCourtAssignment } from "./court-assignment-commit";
import { loadCourtAssignmentReady } from "./court-assignment-load";

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
  const loaded = await loadCourtAssignmentReady(supabase, eventId);
  if (!loaded.success) {
    return loaded;
  }
  return commitCourtAssignment(
    eventId,
    flushQueueNotifications,
    loaded.ctx,
  );
}
