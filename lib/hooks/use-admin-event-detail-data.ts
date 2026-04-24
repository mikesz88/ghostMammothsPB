"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  hydrateAdminSerializedAssignments,
  hydrateAdminSerializedEvent,
  hydrateAdminSerializedQueue,
} from "@/lib/admin/hydrate-admin-event-detail";
import { adminQueueQueryKey, fetchAdminQueueEntries } from "@/lib/admin-queue";

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
  const { data: queue = hydratedInitialQueue } = useQuery({
    queryKey: adminQueueQueryKey(eventId),
    queryFn: () => fetchAdminQueueEntries(eventId),
    enabled: Boolean(eventId),
    initialData: hydratedInitialQueue,
    staleTime: 30_000,
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
