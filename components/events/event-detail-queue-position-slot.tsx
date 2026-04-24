import { QueuePositionAlert } from "@/components/queue-position-alert";

export function EventDetailQueuePositionSlot({
  userPosition,
  isUpNext,
  isPendingStay,
  isPendingSolo,
}: {
  userPosition: number;
  isUpNext: boolean;
  isPendingStay: boolean;
  isPendingSolo: boolean;
}) {
  if (userPosition <= 0) return null;
  return (
    <div className="mb-6">
      <QueuePositionAlert
        position={userPosition}
        isUpNext={isUpNext}
        isPendingStay={isPendingStay}
        isPendingSolo={isPendingSolo}
      />
    </div>
  );
}
