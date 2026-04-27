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

export async function reorderQueue(
  eventId: string,
  options: ReorderQueueOptions,
) {
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

  // Update positions
  for (let i = 0; i < queue.length; i++) {
    const newPosition = i + 1;
    const oldPosition = queue[i].position;

    await supabase
      .from("queue_entries")
      .update({ position: newPosition })
      .eq("id", queue[i].id);

    if (queue[i].status !== "waiting") {
      continue;
    }

    // Send "up next" email if they just entered top 4
    if (newPosition <= 4 && oldPosition > 4) {
      toNotify.push({
        userId: queue[i].user_id,
        eventId,
        position: newPosition,
        notificationType: "up-next",
      });
    }
    // Send position update if they moved up significantly (3+ positions)
    else if (oldPosition - newPosition >= 3) {
      toNotify.push({
        userId: queue[i].user_id,
        eventId,
        position: newPosition,
        notificationType: "position-update",
      });
    }
  }

  await flushQueueNotifications(toNotify).catch((err) =>
    console.error("Error sending queue notification emails:", err),
  );
}
