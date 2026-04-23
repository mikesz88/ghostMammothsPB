import { AdminDashboardEndedEventCardMeta } from "@/components/admin/dashboard/admin-dashboard-ended-event-card-meta";
import { AdminDashboardEndedEventCardToolbar } from "@/components/admin/dashboard/admin-dashboard-ended-event-card-toolbar";
import { Card, CardHeader } from "@/components/ui/card";

import type { Event } from "@/lib/types";

export function AdminDashboardEndedEventCard({
  event,
  onDelete,
}: {
  event: Event;
  onDelete: (eventId: string) => void;
}) {
  return (
    <Card className="border-border bg-card opacity-60">
      <CardHeader>
        <AdminDashboardEndedEventCardToolbar
          eventId={event.id}
          onDelete={onDelete}
        />
        <AdminDashboardEndedEventCardMeta event={event} />
      </CardHeader>
    </Card>
  );
}
