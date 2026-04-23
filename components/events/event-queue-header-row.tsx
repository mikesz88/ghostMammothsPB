import { Bell, QrCode, Trophy } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/membership-helpers";

import type { User as SupabaseAuthUser } from "@supabase/supabase-js";


function queuePositionBadgeLabel(
  userPosition: number,
  isPendingStay: boolean,
  isPendingSolo: boolean,
): string {
  if (isPendingStay) {
    return "On deck for next game";
  }
  if (isPendingSolo) {
    return `Waiting for more solos (#${userPosition})`;
  }
  return `You're #${userPosition}`;
}

function QueueJoinActions({
  canJoin,
  joinReason,
  requiresPayment,
  paymentAmount,
  user,
  onJoinClick,
}: {
  canJoin: boolean;
  joinReason: string | undefined;
  requiresPayment: boolean;
  paymentAmount: number | undefined;
  user: SupabaseAuthUser | null;
  onJoinClick: () => void;
}) {
  if (!canJoin && joinReason) {
    return (
      <div className="flex flex-col items-end gap-2">
        <p className="text-sm text-muted-foreground">{joinReason}</p>
        <Button variant="default" asChild>
          <Link href="/membership">Upgrade Membership</Link>
        </Button>
      </div>
    );
  }

  if (requiresPayment && paymentAmount !== undefined) {
    return (
      <div className="flex flex-col items-end gap-2">
        <p className="text-sm text-muted-foreground">
          {formatPrice(paymentAmount)} to join
        </p>
        <Button onClick={onJoinClick} disabled={!user}>
          Pay & Join Queue
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={onJoinClick} disabled={!user}>
      Join Queue
    </Button>
  );
}

export function EventQueueHeaderRow({
  isCurrentlyPlaying,
  userPosition,
  isPendingStay,
  isPendingSolo,
  canJoin,
  joinReason,
  requiresPayment,
  paymentAmount,
  user,
  isAdmin,
  onJoinClick,
  onShowQrClick,
}: {
  isCurrentlyPlaying: boolean;
  userPosition: number;
  isPendingStay: boolean;
  isPendingSolo: boolean;
  canJoin: boolean;
  joinReason: string | undefined;
  requiresPayment: boolean;
  paymentAmount: number | undefined;
  user: SupabaseAuthUser | null;
  isAdmin: boolean;
  onJoinClick: () => void;
  onShowQrClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
      <div className="space-y-2 min-w-0">
        <h2 className="text-2xl font-bold text-foreground">Queue</h2>
        <Button variant="outline" size="sm" className="w-fit shrink-0" asChild>
          <Link href="/faq#how-to-queue">How to queue up!</Link>
        </Button>
      </div>

      {isCurrentlyPlaying ? (
        <Badge variant="default" className="text-sm">
          <Trophy className="w-3 h-3 mr-1" />
          Currently Playing
        </Badge>
      ) : null}

      {!isCurrentlyPlaying && userPosition > 0 ? (
        <Badge variant="default" className="text-sm">
          <Bell className="w-3 h-3 mr-1" />
          {queuePositionBadgeLabel(
            userPosition,
            isPendingStay,
            isPendingSolo,
          )}
        </Badge>
      ) : null}

      {!isCurrentlyPlaying && userPosition <= 0 ? (
        <div className="flex items-center gap-2">
          <QueueJoinActions
            canJoin={canJoin}
            joinReason={joinReason}
            requiresPayment={requiresPayment}
            paymentAmount={paymentAmount}
            user={user}
            onJoinClick={onJoinClick}
          />
          {isAdmin ? (
            <Button variant="outline" onClick={onShowQrClick}>
              <QrCode className="w-4 h-4 mr-2" />
              Show Queue QR
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
