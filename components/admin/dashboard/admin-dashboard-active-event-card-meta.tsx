import { Calendar, MapPin, Settings } from "lucide-react";

import { CardDescription, CardTitle } from "@/components/ui/card";

import type { Event } from "@/lib/types";

export function AdminDashboardActiveEventCardMeta({ event }: { event: Event }) {
  return (
    <>
      <CardTitle className="text-foreground">{event.name}</CardTitle>
      <CardDescription className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4" />
          {event.location}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4" />
          {event.date.toLocaleDateString()} at{" "}
          {event.date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Settings className="w-4 h-4" />
          {event.courtCount} courts • {event.rotationType}
        </div>
      </CardDescription>
    </>
  );
}
