import type { EventDetailClientGridProps } from "@/components/events/event-detail-client-grid";
import type { useEventDetailClientView } from "@/lib/hooks/use-event-detail-client-view";

type View = ReturnType<typeof useEventDetailClientView>;

export function eventDetailClientGridPropsFromView(
  v: View,
): EventDetailClientGridProps {
  return {
    event: v.event,
    assignments: v.assignments,
    user: v.user,
    queue: v.queue,
    queueLoading: v.queueLoading,
    isCurrentlyPlaying: v.isCurrentlyPlaying,
    userPosition: v.userPosition,
    isPendingStay: v.isPendingStay,
    isPendingSolo: v.isPendingSolo,
    canJoin: v.canJoin,
    joinReason: v.joinReason,
    requiresPayment: v.requiresPayment,
    paymentAmount: v.paymentAmount,
    isAdmin: v.isAdmin,
    onJoinClick: () => v.setShowJoinDialog(true),
    onShowQrClick: () => v.setShowQrDialog(true),
    onCompleteGame: v.handleEndGame,
    onQueueRemove: v.handleQueueRemove,
  };
}
