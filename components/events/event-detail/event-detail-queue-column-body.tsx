import { EventDetailQueueListSection } from "@/components/events/event-detail/event-detail-queue-list-section";
import { EventQueueHeaderRow } from "@/components/events/queue/event-queue-header-row";

import type { EventDetailQueueColumnProps } from "@/components/events/event-detail/event-detail-queue-column-types";

function EventDetailQueueColumnHeaderAdapter(p: EventDetailQueueColumnProps) {
  return (
    <EventQueueHeaderRow
      isCurrentlyPlaying={p.isCurrentlyPlaying}
      userPosition={p.userPosition}
      isPendingStay={p.isPendingStay}
      isPendingSolo={p.isPendingSolo}
      canJoin={p.canJoin}
      joinReason={p.joinReason}
      requiresPayment={p.requiresPayment}
      paymentAmount={p.paymentAmount}
      user={p.user}
      isAdmin={p.isAdmin}
      onJoinClick={p.onJoinClick}
      onShowQrClick={p.onShowQrClick}
    />
  );
}

function EventDetailQueueColumnListAdapter(p: EventDetailQueueColumnProps) {
  return (
    <EventDetailQueueListSection
      queue={p.queue}
      queueLoading={p.queueLoading}
      user={p.user}
      isAdmin={p.isAdmin}
      onQueueRemove={p.onQueueRemove}
      leavingQueueEntryIds={p.leavingQueueEntryIds}
    />
  );
}

export function EventDetailQueueColumnBody(p: EventDetailQueueColumnProps) {
  return (
    <>
      <EventDetailQueueColumnHeaderAdapter {...p} />
      <EventDetailQueueColumnListAdapter {...p} />
    </>
  );
}
