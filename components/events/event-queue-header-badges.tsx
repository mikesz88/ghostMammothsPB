import { EventQueuePlayingBadge } from "@/components/events/event-queue-playing-badge";
import { EventQueuePositionBadge } from "@/components/events/event-queue-position-badge";

export function EventQueueHeaderBadges({
  isCurrentlyPlaying,
  userPosition,
  isPendingStay,
  isPendingSolo,
}: {
  isCurrentlyPlaying: boolean;
  userPosition: number;
  isPendingStay: boolean;
  isPendingSolo: boolean;
}) {
  return (
    <>
      {isCurrentlyPlaying ? <EventQueuePlayingBadge /> : null}
      {!isCurrentlyPlaying && userPosition > 0 ? (
        <EventQueuePositionBadge
          userPosition={userPosition}
          isPendingStay={isPendingStay}
          isPendingSolo={isPendingSolo}
        />
      ) : null}
    </>
  );
}
