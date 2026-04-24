import { TestControls } from "@/components/admin/events/test-controls";
import { adminQueueQueryKey } from "@/lib/admin-queue";

import type { useAdminEventDetailClient } from "@/lib/hooks/use-admin-event-detail-client";

export function AdminEventDetailTestStrip({
  v,
}: {
  v: ReturnType<typeof useAdminEventDetailClient>;
}) {
  return (
    <div className="mb-8">
      <TestControls
        eventId={v.eventId}
        currentRotationType={v.event.rotationType}
        currentTeamSize={v.event.teamSize}
        currentCourtCount={v.event.courtCount}
        onQueueUpdated={() =>
          void v.queryClient.invalidateQueries({
            queryKey: adminQueueQueryKey(v.eventId),
          })
        }
      />
    </div>
  );
}
