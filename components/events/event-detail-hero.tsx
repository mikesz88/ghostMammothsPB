import { EventDetailHeroHeading } from "@/components/events/event-detail-hero-heading";
import { Badge } from "@/components/ui/badge";

import type { Event } from "@/lib/types";

export function EventDetailHero({ event }: { event: Event }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{event.name}</h1>
        <EventDetailHeroHeading event={event} />
      </div>
      <Badge variant="default" className="text-sm">
        {event.status}
      </Badge>
    </div>
  );
}
