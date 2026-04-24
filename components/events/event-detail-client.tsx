"use client";

import { EventDetailClientMain } from "@/components/events/event-detail-client-main";
import { EventDetailClientModals } from "@/components/events/event-detail-client-modals";
import { useEventDetailClientView } from "@/lib/hooks/use-event-detail-client-view";

import type {
  EventDetailAccess,
  EventDetailSerializedAssignment,
  EventDetailSerializedEvent,
} from "@/lib/events/event-detail-server";

export function EventDetailClient(
  p: {
    eventId: string;
    initialEvent: EventDetailSerializedEvent;
    initialAssignments: EventDetailSerializedAssignment[];
    initialAccess: EventDetailAccess;
    initialIsAdmin: boolean;
  },
) {
  const v = useEventDetailClientView(p);
  return (
    <>
      <EventDetailClientMain v={v} />
      <EventDetailClientModals v={v} />
    </>
  );
}
