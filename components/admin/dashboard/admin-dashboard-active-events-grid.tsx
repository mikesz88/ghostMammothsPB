import { AdminDashboardActiveEventCard } from "@/components/admin/dashboard/admin-dashboard-active-event-card";

import type { Event } from "@/lib/types";

export function AdminDashboardActiveEventsGrid({
  events,
  onEdit,
  onDelete,
  onEnd,
}: {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onEnd: (eventId: string) => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {events.map((event) => (
        <AdminDashboardActiveEventCard
          key={event.id}
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
          onEnd={onEnd}
        />
      ))}
    </div>
  );
}
