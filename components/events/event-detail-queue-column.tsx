import { EventDetailQueueColumnBody } from "@/components/events/event-detail-queue-column-body";

import type { EventDetailQueueColumnProps } from "@/components/events/event-detail-queue-column-types";

export type { EventDetailQueueColumnProps as QueueColumnProps };

export function EventDetailQueueColumn(p: EventDetailQueueColumnProps) {
  return (
    <div>
      <EventDetailQueueColumnBody {...p} />
    </div>
  );
}
