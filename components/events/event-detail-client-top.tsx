import { EventDetailClientTopInner } from "@/components/events/event-detail-client-top-inner";

import type { Event } from "@/lib/types";

type TopProps = {
  event: Event;
  userPosition: number;
  isUpNext: boolean;
  isPendingStay: boolean;
  isPendingSolo: boolean;
  waitingCount: number;
  playingCount: number;
};

export function EventDetailClientTop(p: TopProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-8">
        <EventDetailClientTopInner {...p} />
      </div>
    </div>
  );
}
