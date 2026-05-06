import { AdminDashboardEndedEventCard } from "@/components/admin/dashboard/admin-dashboard-ended-event-card";
import { AdminDashboardSectionShell } from "@/components/admin/dashboard/admin-dashboard-section-shell";

import type { Event } from "@/lib/types";

export function AdminDashboardEndedEventsSection({
  events,
  onDelete,
}: {
  events: Event[];
  onDelete: (eventId: string) => void;
}) {
  if (events.length === 0) return null;
  return (
    <AdminDashboardSectionShell title="Ended Events">
      <div className="grid md:grid-cols-2 gap-6">
        {events.map((event) => (
          <AdminDashboardEndedEventCard
            key={event.id}
            event={event}
            onDelete={onDelete}
          />
        ))}
      </div>
    </AdminDashboardSectionShell>
  );
}
