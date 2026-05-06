"use client";

import {
  applyGuestAccessState,
} from "@/lib/hooks/event-detail-access-guest-state";
import { applyUserAccessState } from "@/lib/hooks/event-detail-access-user-fetch";

import type { EventDetailAccess } from "@/lib/events/event-detail-server";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export type EventDetailAccessState = {
  canJoin: boolean;
  joinReason: string | undefined;
  requiresPayment: boolean;
  paymentAmount: number | undefined;
  isAdmin: boolean;
};

export async function syncEventDetailAccessState(
  user: SupabaseAuthUser | null | undefined,
  eventId: string,
  setState: (next: EventDetailAccessState) => void,
) {
  if (!user) {
    applyGuestAccessState(setState);
    return;
  }
  await applyUserAccessState(user, eventId, setState);
}

export function initialAccessState(
  initialAccess: EventDetailAccess,
  initialIsAdmin: boolean,
): EventDetailAccessState {
  return {
    canJoin: initialAccess.canJoin,
    joinReason: initialAccess.joinReason,
    requiresPayment: initialAccess.requiresPayment,
    paymentAmount: initialAccess.paymentAmount,
    isAdmin: initialIsAdmin,
  };
}
