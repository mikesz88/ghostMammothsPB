"use client";

import { useEffect } from "react";

import { subscribeAdminQueueInvalidate } from "@/lib/admin/admin-queue-invalidate-channel";

import type { QueryClient } from "@tanstack/react-query";

export function useAdminQueueInvalidateRealtime(
  eventId: string,
  queryClient: QueryClient,
) {
  useEffect(() => {
    return subscribeAdminQueueInvalidate(eventId, queryClient);
  }, [eventId, queryClient]);
}
