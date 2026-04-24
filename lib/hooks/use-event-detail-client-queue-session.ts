"use client";

import { useEventQueueLink } from "@/lib/hooks/use-event-queue-link";
import { useRealtimeQueue } from "@/lib/hooks/use-realtime-queue";
import { useNotifications } from "@/lib/use-notifications";

export function useEventDetailClientQueueSession(eventId: string) {
  const qr = useRealtimeQueue(eventId);
  const { sendNotification } = useNotifications();
  const queueLink = useEventQueueLink(eventId);
  return {
    queue: qr.queue,
    queueLoading: qr.loading,
    refetchQueue: qr.refetch,
    sendNotification,
    queueLink,
  };
}
