import type { QueueEntry } from "@/lib/types";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export type EventDetailQueueColumnProps = {
  queue: QueueEntry[];
  queueLoading: boolean;
  user: SupabaseAuthUser | null;
  isAdmin: boolean;
  isCurrentlyPlaying: boolean;
  userPosition: number;
  isPendingStay: boolean;
  isPendingSolo: boolean;
  canJoin: boolean;
  joinReason: string | undefined;
  requiresPayment: boolean;
  paymentAmount: number | undefined;
  onJoinClick: () => void;
  onShowQrClick: () => void;
  onQueueRemove: (entryId: string) => void | Promise<void>;
};
