import { Clock, Trophy, Users } from "lucide-react";

import { EventDetailStatTile } from "@/components/events/event-detail-stat-tile";
import { QueueManager } from "@/lib/queue-manager";

import type { Event } from "@/lib/types";

function eventDetailStatsPrimaryTiles(
  waitingCount: number,
  playingCount: number,
) {
  return [
    {
      icon: Users,
      iconBgClass: "bg-primary/10",
      iconClass: "text-primary",
      value: waitingCount,
      label: "In Queue",
    },
    {
      icon: Trophy,
      iconBgClass: "bg-accent/10",
      iconClass: "text-accent",
      value: playingCount,
      label: "Playing Now",
    },
  ] as const;
}

function buildEventDetailStatsTiles(
  event: Event,
  waitingCount: number,
  playingCount: number,
) {
  const wait = QueueManager.estimateWaitTime(
    waitingCount,
    event.courtCount,
    event.teamSize,
  );
  return [
    ...eventDetailStatsPrimaryTiles(waitingCount, playingCount),
    {
      icon: Clock,
      iconBgClass: "bg-primary/10",
      iconClass: "text-primary",
      value: `${wait}m`,
      label: "Est. Wait",
    },
  ] as const;
}

export function EventDetailStatsRow({
  event,
  waitingCount,
  playingCount,
}: {
  event: Event;
  waitingCount: number;
  playingCount: number;
}) {
  const tiles = buildEventDetailStatsTiles(event, waitingCount, playingCount);
  return (
    <div className="grid grid-cols-3 gap-4">
      {tiles.map((t) => (
        <EventDetailStatTile key={t.label} {...t} />
      ))}
    </div>
  );
}
