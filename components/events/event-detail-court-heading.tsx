import { Badge } from "@/components/ui/badge";

import type { Event } from "@/lib/types";

export function EventDetailCourtHeading({ event }: { event: Event }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold text-foreground">Court Status</h2>
      <Badge variant="outline">{event.courtCount} courts</Badge>
    </div>
  );
}
