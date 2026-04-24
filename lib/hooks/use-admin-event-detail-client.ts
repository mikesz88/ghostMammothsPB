"use client";

import { useAdminEventDetailActions } from "@/lib/hooks/use-admin-event-detail-actions";
import { useAdminEventDetailData } from "@/lib/hooks/use-admin-event-detail-data";
import { useAdminEventDetailRealtime } from "@/lib/hooks/use-admin-event-detail-realtime";

import type { AdminEventDetailPagePayload } from "@/lib/admin/admin-event-detail-server";

export function useAdminEventDetailClient(payload: AdminEventDetailPagePayload) {
  const d = useAdminEventDetailData(payload);
  useAdminEventDetailRealtime(d.eventId, d.queryClient, d.setAssignments);
  const actions = useAdminEventDetailActions(d.eventId, d.event, d.queryClient);
  const waitingCount = d.queue.filter(
    (e) => e.status === "waiting" || e.status === "pending_solo",
  ).length;
  const playingCount =
    d.assignments.filter((a) => !a.endedAt).length * d.event.teamSize * 2;
  return {
    event: d.event,
    assignments: d.assignments,
    queue: d.queue,
    queryClient: d.queryClient,
    eventId: d.eventId,
    waitingCount,
    playingCount,
    ...actions,
  };
}
