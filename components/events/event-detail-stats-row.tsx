import { Clock, Trophy, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { QueueManager } from "@/lib/queue-manager";

import type { Event } from "@/lib/types";

export function EventDetailStatsRow({
  event,
  waitingCount,
  playingCount,
}: {
  event: Event;
  waitingCount: number;
  playingCount: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="border-border bg-background">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{waitingCount}</p>
              <p className="text-sm text-muted-foreground">In Queue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-background">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {playingCount}
              </p>
              <p className="text-sm text-muted-foreground">Playing Now</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-background">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {QueueManager.estimateWaitTime(
                  waitingCount,
                  event.courtCount,
                  event.teamSize,
                )}
                m
              </p>
              <p className="text-sm text-muted-foreground">Est. Wait</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
