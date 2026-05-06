import { Calendar, MapPin, Users } from "lucide-react";

import {
  rotationTypeDisplayLabel,
  teamSizeDisplayLabel,
} from "@/lib/events/event-display-labels";

import type { Event } from "@/lib/types";

export function EventDetailHeroHeading({ event }: { event: Event }) {
  return (
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
  );
}
