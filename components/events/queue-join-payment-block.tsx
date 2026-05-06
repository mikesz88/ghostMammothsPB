import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/membership-helpers";

import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export function QueueJoinPaymentBlock({
  paymentAmount,
  user,
  onJoinClick,
}: {
  paymentAmount: number;
  user: SupabaseAuthUser | null;
  onJoinClick: () => void;
}) {
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
