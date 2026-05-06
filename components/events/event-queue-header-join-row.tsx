import { EventQueueQrButton } from "@/components/events/event-queue-qr-button";
import { QueueJoinActions } from "@/components/events/queue-join-actions";

import type { EventQueueHeaderRowProps } from "@/components/events/event-queue-header-row-types";

type JoinRowProps = Pick<
  EventQueueHeaderRowProps,
  | "canJoin"
  | "joinReason"
  | "requiresPayment"
  | "paymentAmount"
  | "user"
  | "isAdmin"
  | "onJoinClick"
  | "onShowQrClick"
>;

export function EventQueueHeaderJoinRow(p: JoinRowProps) {
  return (
    <div className="flex items-center gap-2">
      <QueueJoinActions
        canJoin={p.canJoin}
        joinReason={p.joinReason}
        requiresPayment={p.requiresPayment}
        paymentAmount={p.paymentAmount}
        user={p.user}
        onJoinClick={p.onJoinClick}
      />
      {p.isAdmin ? <EventQueueQrButton onShowQrClick={p.onShowQrClick} /> : null}
    </div>
  );
}
