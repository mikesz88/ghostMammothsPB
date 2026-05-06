import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export type EventQueueHeaderRowProps = {
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
};
