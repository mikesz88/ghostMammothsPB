import { EventDetailClientGridBridge } from "@/components/events/event-detail/event-detail-client-grid-bridge";
import { EventDetailClientTopBridge } from "@/components/events/event-detail/event-detail-client-top-bridge";

import type { useEventDetailClientView } from "@/lib/hooks/event-detail/use-event-detail-client-view";

type View = ReturnType<typeof useEventDetailClientView>;

export function EventDetailClientMain({ v }: { v: View }) {
  return (
    <>
      <EventDetailClientTopBridge v={v} />
      <EventDetailClientGridBridge v={v} />
    </>
  );
}
