"use client";

import { useEventQueueLink } from "@/lib/hooks/queue/use-event-queue-link";
import { useRealtimeQueue } from "@/lib/hooks/queue/use-realtime-queue";
import { useNotifications } from "@/lib/notifications/use-notifications";

export function useEventDetailClientQueueSession(eventId: string) {
  const qr = useRealtimeQueue(eventId);
  const { sendNotification } = useNotifications();
  const queueLink = useEventQueueLink(eventId);
  return {
    queue: qr.queue,
    queueLoading: qr.loading,
    refetchQueue: qr.refetch,
    beginOptimisticQueueLeave: qr.beginOptimisticQueueLeave,
    clearOptimisticQueueLeave: qr.clearOptimisticQueueLeave,
    sendNotification,
    queueLink,
  };
}
