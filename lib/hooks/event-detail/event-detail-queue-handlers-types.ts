import type { NotificationType } from "@/lib/notifications/use-notifications";
import type { CourtAssignment, Event, QueueEntry } from "@/lib/types";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export type JoinPlayer = { name: string; skillLevel: string };

export type SendNotification = (
  type: NotificationType,
  title: string,
  options?: NotificationOptions,
) => void;

export type EventDetailQueueHandlersParams = {
  eventId: string;
  event: Event;
  user: SupabaseAuthUser | null;
  queue: QueueEntry[];
  assignments: CourtAssignment[];
  isAdmin: boolean;
  waitingCount: number;
  refetchQueue: () => Promise<void>;
  sendNotification: SendNotification;
  setShowJoinDialog: (open: boolean) => void;
  beginOptimisticQueueLeave: (
    entry: QueueEntry,
    snapshotQueue: QueueEntry[],
  ) => void;
  clearOptimisticQueueLeave: () => void;
};

export function isActiveQueueStatus(status: QueueEntry["status"]): boolean {
  return (
    status === "waiting" ||
    status === "pending_solo" ||
    status === "pending_stay"
  );
}
