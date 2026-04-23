"use client";

import type { EventDetailAccessState } from "@/lib/hooks/event-detail-access-sync-logic";

export function applyGuestAccessState(
  setState: (next: EventDetailAccessState) => void,
) {
  setState({
    canJoin: true,
    joinReason: undefined,
    requiresPayment: false,
    paymentAmount: undefined,
    isAdmin: false,
  });
}
