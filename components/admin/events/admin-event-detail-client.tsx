"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AdminEventCourtsPanel } from "@/components/admin/events/admin-event-courts-panel";
import { AdminEventHeaderCard } from "@/components/admin/events/admin-event-header-card";
import { AdminEventQueuePanel } from "@/components/admin/events/admin-event-queue-panel";
import { TestControls } from "@/components/admin/events/test-controls";
import { Header } from "@/components/ui/header";
import {
  hydrateAdminSerializedAssignments,
  hydrateAdminSerializedEvent,
  hydrateAdminSerializedQueue,
} from "@/lib/admin/hydrate-admin-event-detail";
import { adminQueueQueryKey, fetchAdminQueueEntries } from "@/lib/admin-queue";
import { useAdminEventDetailActions } from "@/lib/hooks/use-admin-event-detail-actions";
import { useAdminEventDetailRealtime } from "@/lib/hooks/use-admin-event-detail-realtime";

import type { AdminEventDetailPagePayload } from "@/lib/admin/admin-event-detail-server";
import type { CourtAssignment } from "@/lib/types";

export function AdminEventDetailClient({
  eventId,
  initialEvent,
  initialAssignments,
  initialQueue,
  isTestEvent,
}: AdminEventDetailPagePayload) {
  const event = useMemo(
    () => hydrateAdminSerializedEvent(initialEvent),
    [initialEvent],
  );

  const [assignments, setAssignments] = useState<CourtAssignment[]>(() =>
    hydrateAdminSerializedAssignments(initialAssignments),
  );

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

  useAdminEventDetailRealtime(eventId, queryClient, setAssignments);

  const {
    handleAssignNext,
    handleForceRemove,
    handleClearQueue,
    handleEndGame,
  } = useAdminEventDetailActions(eventId, event, queryClient);

  const waitingCount = queue.filter(
    (e) => e.status === "waiting" || e.status === "pending_solo",
  ).length;
  const playingCount =
    assignments.filter((a) => !a.endedAt).length * event.teamSize * 2;

  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="admin"
        backButton={{ href: "/admin", label: "Back to Dashboard" }}
      />

      <div className="container mx-auto px-4 py-8">
        {isTestEvent ? (
          <div className="mb-8">
            <TestControls
              eventId={eventId}
              currentRotationType={event.rotationType}
              currentTeamSize={event.teamSize}
              currentCourtCount={event.courtCount}
              onQueueUpdated={() =>
                void queryClient.invalidateQueries({
                  queryKey: adminQueueQueryKey(eventId),
                })
              }
            />
          </div>
        ) : null}

        <AdminEventHeaderCard
          event={event}
          waitingCount={waitingCount}
          playingCount={playingCount}
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <AdminEventCourtsPanel
            event={event}
            assignments={assignments}
            onCompleteGame={handleEndGame}
          />
          <AdminEventQueuePanel
            waitingCount={waitingCount}
            queue={queue}
            onAssignNext={handleAssignNext}
            onClearQueue={handleClearQueue}
            onRemoveEntry={handleForceRemove}
          />
        </div>
      </div>
    </div>
  );
}
