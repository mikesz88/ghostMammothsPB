import { AdminDashboardActiveEventsEmpty } from "@/components/admin/dashboard/admin-dashboard-active-events-empty";
import { AdminDashboardActiveEventsGrid } from "@/components/admin/dashboard/admin-dashboard-active-events-grid";

import type { Event } from "@/lib/types";

export function AdminDashboardActiveEventsBody({
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
  if (events.length === 0) {
    return <AdminDashboardActiveEventsEmpty onCreateClick={onCreateClick} />;
  }
  return (
    <AdminDashboardActiveEventsGrid
      events={events}
      onEdit={onEdit}
      onDelete={onDelete}
      onEnd={onEnd}
    />
  );
}
