"use client";

import { canUserJoinEvent } from "@/lib/membership-helpers";
import { createClient } from "@/lib/supabase/client";

import type { EventDetailAccessState } from "@/lib/hooks/event-detail-access-sync-logic";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export async function applyUserAccessState(
  user: SupabaseAuthUser,
  eventId: string,
  setState: (next: EventDetailAccessState) => void,
) {
  const access = await canUserJoinEvent(user.id, eventId);
  const { data: profile } = await createClient()
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  setState({
    canJoin: access.canJoin,
    joinReason: access.reason,
    requiresPayment: access.requiresPayment,
    paymentAmount: access.amount,
    isAdmin: profile?.is_admin ?? false,
  });
}
