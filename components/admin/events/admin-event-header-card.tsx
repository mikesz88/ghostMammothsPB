import { AdminEventHeaderCounts } from "@/components/admin/events/admin-event-header-counts";
import { AdminEventHeaderTop } from "@/components/admin/events/admin-event-header-top";
import { Card, CardContent } from "@/components/ui/card";

import type { Event } from "@/lib/types";

export function AdminEventHeaderCard({
  event,
  waitingCount,
  playingCount,
}: {
  event: Event;
  waitingCount: number;
  playingCount: number;
}) {
  return (
    <Card className="border-border mb-8">
      <CardContent className="p-6">
        <AdminEventHeaderTop event={event} />
        <AdminEventHeaderCounts
          waitingCount={waitingCount}
          playingCount={playingCount}
        />
      </CardContent>
    </Card>
  );
}
