"use client";

import { adminQueueQueryKey } from "@/lib/admin-queue";
import { createClient } from "@/lib/supabase/client";

import type { QueryClient } from "@tanstack/react-query";

function queueEntriesChangeFilter(eventId: string) {
  return {
    event: "*" as const,
    schema: "public",
    table: "queue_entries",
    filter: `event_id=eq.${eventId}`,
  };
}

function invalidateAdminQueue(eventId: string, queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    queryKey: adminQueueQueryKey(eventId),
  });
}

export function subscribeAdminQueueInvalidate(
  eventId: string,
  queryClient: QueryClient,
) {
  const supabase = createClient();
  const onChange = () => invalidateAdminQueue(eventId, queryClient);
  const channel = supabase
    .channel(`admin-queue-${eventId}`)
    .on(
      "postgres_changes",
      queueEntriesChangeFilter(eventId),
      onChange,
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
