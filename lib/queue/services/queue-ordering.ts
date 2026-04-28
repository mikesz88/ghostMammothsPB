import { createClient } from "@/lib/supabase/server";

import type { DbClient } from "@/lib/queue/types";

type QueueNotification = {
  userId: string;
  eventId: string;
  position: number;
  notificationType: "up-next" | "position-update";
};

type FlushQueueNotifications = (notifications: QueueNotification[]) => Promise<void>;

type ReorderQueueOptions = {
  db?: DbClient;
  flushQueueNotifications: FlushQueueNotifications;
};

function notificationForReorderChange(
  eventId: string,
  row: { user_id: string; status: string },
  newPosition: number,
  oldPosition: number,
): QueueNotification | null {
  if (row.status !== "waiting") return null;
  if (newPosition <= 4 && oldPosition > 4) {
    return {
      userId: row.user_id,
      eventId,
      position: newPosition,
      notificationType: "up-next",
    };
  }
  if (oldPosition - newPosition >= 3) {
    return {
      userId: row.user_id,
      eventId,
      position: newPosition,
      notificationType: "position-update",
    };
  }
  return null;
}

export async function reorderQueue(eventId: string, options: ReorderQueueOptions) {
  const supabase = options.db ?? (await createClient());
  const { flushQueueNotifications } = options;

  const { data: queue } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("event_id", eventId)
    .in("status", ["waiting", "pending_solo"])
    .order("position");

  if (!queue) return;

  const toNotify: QueueNotification[] = [];
  for (let i = 0; i < queue.length; i++) {
    const newPosition = i + 1;
    const oldPosition = queue[i].position;
    await supabase.from("queue_entries").update({ position: newPosition }).eq("id", queue[i].id);
    const n = notificationForReorderChange(eventId, queue[i], newPosition, oldPosition);
    if (n) toNotify.push(n);
  }

  await flushQueueNotifications(toNotify).catch((err) =>
    console.error("Error sending queue notification emails:", err),
  );
}
