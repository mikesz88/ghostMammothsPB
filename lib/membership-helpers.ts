import { getUserMembership } from "@/lib/membership/get-user-membership";
import { createClient } from "@/lib/supabase/client";

import type { AppSupabaseClient } from "@/lib/membership/supabase-client-type";
import type { MembershipStatus } from "@/lib/types-membership";

export type { UserMembershipInfo } from "@/lib/membership/user-membership-types";
export { getUserMembership };

/**
 * Check if user can join an event based on membership
 */
export async function canUserJoinEvent(
  userId: string,
  eventId: string,
  supabaseClient?: AppSupabaseClient,
): Promise<{
  canJoin: boolean;
  reason?: string;
  requiresPayment: boolean;
  amount?: number;
}> {
  const supabase = supabaseClient ?? createClient();

  const { data: event } = await supabase
    .from("events")
    .select("price, free_for_members, requires_membership")
    .eq("id", eventId)
    .single();

  if (!event) {
    return {
      canJoin: false,
      reason: "Event not found",
      requiresPayment: false,
    };
  }

  const membership = await getUserMembership(userId, supabase);

  const { data: registration } = await supabase
    .from("event_registrations")
    .select("payment_status")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .single();

  if (registration && registration.payment_status === "paid") {
    return {
      canJoin: true,
      requiresPayment: false,
    };
  }

  if (!event.price || event.price === 0) {
    return {
      canJoin: true,
      requiresPayment: false,
    };
  }

  if (event.requires_membership && !membership.isPaid) {
    return {
      canJoin: false,
      reason: "This event requires a paid membership",
      requiresPayment: false,
    };
  }

  if (event.free_for_members && membership.isPaid && membership.isActive) {
    return {
      canJoin: true,
      requiresPayment: false,
    };
  }

  return {
    canJoin: true,
    reason: "Payment required to join this event",
    requiresPayment: true,
    amount: event.price,
  };
}

/**
 * Check if user has active paid membership
 */
export async function hasActiveMembership(userId: string): Promise<boolean> {
  const membership = await getUserMembership(userId);
  return membership.isPaid && membership.isActive;
}

/**
 * Get membership tier display information
 */
export function getMembershipDisplayInfo(tierName: string) {
  const tiers: Record<
    string,
    {
      displayName: string;
      description: string;
      color: string;
      features: string[];
    }
  > = {
    free: {
      displayName: "Free Member",
      description: "Basic access to events",
      color: "gray",
      features: [
        "Can join free events",
        "Pay per paid event",
        "Basic features",
        "Standard queue position",
      ],
    },
    monthly: {
      displayName: "Monthly Member",
      description: "Unlimited event access",
      color: "blue",
      features: [
        "Free entry to ALL events",
        "Priority queue position",
        "Exclusive events access",
        "10% merchandise discount",
        "Email notifications",
      ],
    },
  };

  return tiers[tierName] || tiers.free;
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Get membership status badge color
 */
export function getMembershipBadgeVariant(
  status: MembershipStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
    case "trialing":
      return "default";
    case "cancelled":
    case "expired":
      return "secondary";
    case "past_due":
      return "destructive";
    default:
      return "outline";
  }
}
