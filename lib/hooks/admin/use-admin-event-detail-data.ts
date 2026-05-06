"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { adminQueueQueryKey, fetchAdminQueueEntries } from "@/lib/admin/admin-queue";
import {
  hydrateAdminSerializedAssignments,
  hydrateAdminSerializedEvent,
  hydrateAdminSerializedQueue,
} from "@/lib/admin/hydrate-admin-event-detail";
import { queuePollIntervalMs } from "@/lib/realtime/queue-poll-interval";

import type { AdminEventDetailPagePayload } from "@/lib/admin/admin-event-detail-server";
import type { CourtAssignment } from "@/lib/types";

function useAdminEventQueue(
  eventId: string,
  initialQueue: AdminEventDetailPagePayload["initialQueue"],
) {
  const queryClient = useQueryClient();
  const hydratedInitialQueue = useMemo(
    () => hydrateAdminSerializedQueue(initialQueue),
    [initialQueue],
  );
  const pollMs = queuePollIntervalMs();
  const { data: queue = hydratedInitialQueue } = useQuery({
    queryKey: adminQueueQueryKey(eventId),
    queryFn: () => fetchAdminQueueEntries(eventId),
    enabled: Boolean(eventId),
    initialData: hydratedInitialQueue,
    // Realtime invalidation must refetch immediately; long staleTime can leave
    // admin UI stale if postgres_changes does not fire (e.g. RLS).
    staleTime: 0,
    refetchInterval: pollMs > 0 ? pollMs : false,
  });
  return { queue, queryClient };
}

export function useAdminEventDetailData({
  eventId,
  initialEvent,
  initialAssignments,
  initialQueue,
}: AdminEventDetailPagePayload) {
  const event = useMemo(
    () => hydrateAdminSerializedEvent(initialEvent),
    [initialEvent],
  );
  const [assignments, setAssignments] = useState<CourtAssignment[]>(() =>
    hydrateAdminSerializedAssignments(initialAssignments),
  );
  const { queue, queryClient } = useAdminEventQueue(eventId, initialQueue);
  return { event, assignments, setAssignments, queue, queryClient, eventId };
}
