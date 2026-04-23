import { AdminDashboardActiveEventCardActions } from "@/components/admin/dashboard/admin-dashboard-active-event-card-actions";
import { AdminDashboardActiveEventCardMeta } from "@/components/admin/dashboard/admin-dashboard-active-event-card-meta";
import { AdminDashboardActiveEventCardToolbar } from "@/components/admin/dashboard/admin-dashboard-active-event-card-toolbar";
import { Card, CardHeader } from "@/components/ui/card";

import type { Event } from "@/lib/types";

export function AdminDashboardActiveEventCard({
  event,
  onEdit,
  onDelete,
  onEnd,
}: {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onEnd: (eventId: string) => void;
}) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <AdminDashboardActiveEventCardToolbar
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        <AdminDashboardActiveEventCardMeta event={event} />
      </CardHeader>
      <AdminDashboardActiveEventCardActions event={event} onEnd={onEnd} />
    </Card>
  );
}
