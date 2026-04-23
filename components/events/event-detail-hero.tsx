import { Calendar, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  rotationTypeDisplayLabel,
  teamSizeDisplayLabel,
} from "@/lib/events/event-display-labels";

import type { Event } from "@/lib/types";

export function EventDetailHero({ event }: { event: Event }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {event.name}
        </h1>
        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {event.location}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(event.date).toLocaleDateString()} at{" "}
            {new Date(event.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {teamSizeDisplayLabel(event.teamSize)} •{" "}
            {rotationTypeDisplayLabel(event.rotationType)}
          </div>
        </div>
      </div>
      <Badge variant="default" className="text-sm">
        {event.status}
      </Badge>
    </div>
  );
}
