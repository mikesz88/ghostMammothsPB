import { QueueJoinDefaultButton } from "@/components/events/queue-join-default-button";
import { QueueJoinPaymentBlock } from "@/components/events/queue-join-payment-block";
import { QueueJoinUpgradePrompt } from "@/components/events/queue-join-upgrade-prompt";

import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

type QueueJoinActionsProps = {
  canJoin: boolean;
  joinReason: string | undefined;
  requiresPayment: boolean;
  paymentAmount: number | undefined;
  user: SupabaseAuthUser | null;
  onJoinClick: () => void;
};

export function QueueJoinActions(p: QueueJoinActionsProps) {
  if (!p.canJoin && p.joinReason) {
    return <QueueJoinUpgradePrompt joinReason={p.joinReason} />;
  }
  if (p.requiresPayment && p.paymentAmount !== undefined) {
    return (
      <QueueJoinPaymentBlock
        paymentAmount={p.paymentAmount}
        user={p.user}
        onJoinClick={p.onJoinClick}
      />
    );
  }
  return <QueueJoinDefaultButton user={p.user} onJoinClick={p.onJoinClick} />;
}
