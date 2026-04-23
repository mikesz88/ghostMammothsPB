import { AdminEventCourtsPanel } from "@/components/admin/events/admin-event-courts-panel";
import { AdminEventQueuePanel } from "@/components/admin/events/admin-event-queue-panel";

import type { useAdminEventDetailClient } from "@/lib/hooks/use-admin-event-detail-client";

export function AdminEventCourtsQueueGrid({
  v,
}: {
  v: ReturnType<typeof useAdminEventDetailClient>;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <AdminEventCourtsPanel
        event={v.event}
        assignments={v.assignments}
        onCompleteGame={v.handleEndGame}
      />
      <AdminEventQueuePanel
        waitingCount={v.waitingCount}
        queue={v.queue}
        onAssignNext={v.handleAssignNext}
        onClearQueue={v.handleClearQueue}
        onRemoveEntry={v.handleForceRemove}
      />
    </div>
  );
}
