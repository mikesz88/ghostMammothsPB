import { EventDetailClientTop } from "@/components/events/event-detail-client-top";

import type { useEventDetailClientView } from "@/lib/hooks/use-event-detail-client-view";

type View = ReturnType<typeof useEventDetailClientView>;

export function EventDetailClientTopBridge({ v }: { v: View }) {
  return (
    <EventDetailClientTop
      event={v.event}
      userPosition={v.userPosition}
      isUpNext={v.isUpNext}
      isPendingStay={v.isPendingStay}
      isPendingSolo={v.isPendingSolo}
      waitingCount={v.waitingCount}
      playingCount={v.playingCount}
    />
  );
}
