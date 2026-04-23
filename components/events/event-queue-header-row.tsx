import { EventQueueHeaderBadges } from "@/components/events/event-queue-header-badges";
import { EventQueueHeaderJoinRow } from "@/components/events/event-queue-header-join-row";
import { EventQueueHeaderTitle } from "@/components/events/event-queue-header-title";

import type { EventQueueHeaderRowProps } from "@/components/events/event-queue-header-row-types";

export function EventQueueHeaderRow(p: EventQueueHeaderRowProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
      <EventQueueHeaderTitle />
      <EventQueueHeaderBadges
        isCurrentlyPlaying={p.isCurrentlyPlaying}
        userPosition={p.userPosition}
        isPendingStay={p.isPendingStay}
        isPendingSolo={p.isPendingSolo}
      />
      {!p.isCurrentlyPlaying && p.userPosition <= 0 ? (
        <EventQueueHeaderJoinRow
          canJoin={p.canJoin}
          joinReason={p.joinReason}
          requiresPayment={p.requiresPayment}
          paymentAmount={p.paymentAmount}
          user={p.user}
          isAdmin={p.isAdmin}
          onJoinClick={p.onJoinClick}
          onShowQrClick={p.onShowQrClick}
        />
      ) : null}
    </div>
  );
}
