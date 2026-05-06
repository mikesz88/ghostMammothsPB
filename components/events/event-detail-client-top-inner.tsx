import { EventDetailHero } from "@/components/events/event-detail-hero";
import { EventDetailNotificationSlot } from "@/components/events/event-detail-notification-slot";
import { EventDetailQueuePositionSlot } from "@/components/events/event-detail-queue-position-slot";
import { EventDetailStatsRow } from "@/components/events/event-detail-stats-row";

import type { Event } from "@/lib/types";

type TopInnerProps = {
  event: Event;
  userPosition: number;
  isUpNext: boolean;
  isPendingStay: boolean;
  isPendingSolo: boolean;
  waitingCount: number;
  playingCount: number;
};

export function EventDetailClientTopInner(p: TopInnerProps) {
  return (
    <>
      <EventDetailHero event={p.event} />
      <EventDetailNotificationSlot />
      <EventDetailQueuePositionSlot
        userPosition={p.userPosition}
        isUpNext={p.isUpNext}
        isPendingStay={p.isPendingStay}
        isPendingSolo={p.isPendingSolo}
      />
      <EventDetailStatsRow
        event={p.event}
        waitingCount={p.waitingCount}
        playingCount={p.playingCount}
      />
    </>
  );
}
