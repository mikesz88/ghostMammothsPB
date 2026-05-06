import { reconcilePendingSoloForEvent } from "@/lib/queue/pending-solo";
import { reorderQueue } from "@/lib/queue/services/queue-ordering";

import type { DbClient } from "@/lib/queue/types";

type QueueNotification = {
  userId: string;
  eventId: string;
  position: number;
  notificationType: "up-next" | "position-update" | "court-assignment";
  courtNumber?: number;
};

type FlushQueueNotifications = (notifications: QueueNotification[]) => Promise<void>;

type QueueMaintenanceOptions = {
  db?: DbClient;
  flushQueueNotifications: FlushQueueNotifications;
};

/** Standard maintenance after queue mutation: solo reconcile then reorder. */
export async function runQueueMaintenance(
  eventId: string,
  options: QueueMaintenanceOptions,
) {
  await reconcilePendingSoloForEvent(eventId, options.db);
  await reorderQueue(eventId, {
    db: options.db,
    flushQueueNotifications: options.flushQueueNotifications,
  });
}

/**
 * Legacy maintenance flow used by leave/admin remove:
 * reorder once first, then reconcile, then reorder again.
 */
export async function runQueueMaintenanceWithPreReorder(
  eventId: string,
  options: QueueMaintenanceOptions,
) {
  await reorderQueue(eventId, {
    db: options.db,
    flushQueueNotifications: options.flushQueueNotifications,
  });
  await reconcilePendingSoloForEvent(eventId, options.db);
  await reorderQueue(eventId, {
    db: options.db,
    flushQueueNotifications: options.flushQueueNotifications,
  });
}
