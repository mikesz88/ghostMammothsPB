import { AdminDashboardActiveEventManageLinks } from "@/components/admin/dashboard/admin-dashboard-active-event-manage-links";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";


import type { Event } from "@/lib/types";

export function AdminDashboardActiveEventCardActions({
  event,
  onEnd,
}: {
  event: Event;
  onEnd: (eventId: string) => void;
}) {
  return (
    <CardContent>
      <AdminDashboardActiveEventManageLinks event={event} />
      <Button
        variant="destructive"
        className="w-full mt-2"
        size="sm"
        onClick={() => onEnd(event.id)}
      >
        End Event
      </Button>
    </CardContent>
  );
}
