import { Calendar, Clock, MapPin, Trophy, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  rotationTypeDisplayLabel,
  teamSizeDisplayLabel,
} from "@/lib/events/event-display-labels";

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
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {event.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{event.date.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {event.date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  {teamSizeDisplayLabel(event.teamSize)} •{" "}
                  {rotationTypeDisplayLabel(event.rotationType)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>{event.courtCount} Courts</span>
              </div>
            </div>
          </div>
          <Badge variant={event.status === "active" ? "default" : "secondary"}>
            {event.status}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-sm text-muted-foreground">
              {waitingCount} Waiting
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">
              {playingCount} Playing
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
