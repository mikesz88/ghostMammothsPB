import { EventDetailClientGrid } from "@/components/events/event-detail/event-detail-client-grid";
import { eventDetailClientGridPropsFromView } from "@/components/events/event-detail/event-detail-client-grid-props";

import type { useEventDetailClientView } from "@/lib/hooks/event-detail/use-event-detail-client-view";

type View = ReturnType<typeof useEventDetailClientView>;

export function EventDetailClientGridBridge({ v }: { v: View }) {
  return <EventDetailClientGrid {...eventDetailClientGridPropsFromView(v)} />;
}
