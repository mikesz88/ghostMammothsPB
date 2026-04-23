import { AdminEventCourtsQueueGrid } from "@/components/admin/events/admin-event-courts-queue-grid";
import { AdminEventHeaderCard } from "@/components/admin/events/admin-event-header-card";

import type { useAdminEventDetailClient } from "@/lib/hooks/use-admin-event-detail-client";

export function AdminEventDetailColumns({
  v,
}: {
  v: ReturnType<typeof useAdminEventDetailClient>;
}) {
  return (
    <>
      <AdminEventHeaderCard
        event={v.event}
        waitingCount={v.waitingCount}
        playingCount={v.playingCount}
      />
      <AdminEventCourtsQueueGrid v={v} />
    </>
  );
}
