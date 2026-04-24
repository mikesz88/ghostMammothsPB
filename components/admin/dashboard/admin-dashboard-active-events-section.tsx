import { AdminDashboardActiveEventsBody } from "@/components/admin/dashboard/admin-dashboard-active-events-body";
import { AdminDashboardSectionShell } from "@/components/admin/dashboard/admin-dashboard-section-shell";

import type { Event } from "@/lib/types";

export function AdminDashboardActiveEventsSection({
  events,
  onCreateClick,
  onEdit,
  onDelete,
  onEnd,
}: {
  events: Event[];
  onCreateClick: () => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onEnd: (eventId: string) => void;
}) {
  return (
    <AdminDashboardSectionShell title="Active Events">
      <AdminDashboardActiveEventsBody
        events={events}
        onCreateClick={onCreateClick}
        onEdit={onEdit}
        onDelete={onDelete}
        onEnd={onEnd}
      />
    </AdminDashboardSectionShell>
  );
}
