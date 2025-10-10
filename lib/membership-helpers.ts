import { createClient } from "@/lib/supabase/client";
import type { MembershipStatus } from "@/lib/types-membership";

export interface UserMembershipInfo {
  status: MembershipStatus;
  tierName: string;
  isActive: boolean;
  isPaid: boolean;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

/**
 * Get user's current membership information
 */
export async function getUserMembership(
  userId: string
): Promise<UserMembershipInfo> {
  const supabase = createClient();

  const { data: membership } = await supabase
    .from("user_memberships")
    .select(
      `
      *,
      tier:membership_tiers(*)
    `
    )
    .eq("user_id", userId)
    .single();

  if (!membership || !membership.tier) {
    // No membership found, return free tier
    return {
      status: "free",
      tierName: "free",
      isActive: true,
      isPaid: false,
    };
  }

  const isActive =
    membership.status === "active" || membership.status === "trialing";
  const isPaid = membership.tier.name === "monthly";

  return {
    status: membership.status,
    tierName: membership.tier.name,
    isActive,
    isPaid,
    currentPeriodEnd: membership.current_period_end
      ? new Date(membership.current_period_end)
      : undefined,
    cancelAtPeriodEnd: membership.cancel_at_period_end,
  };
}

/**
 * Check if user can join an event based on membership
 */
export async function canUserJoinEvent(
  userId: string,
  eventId: string
): Promise<{
  canJoin: boolean;
  reason?: string;
  requiresPayment: boolean;
  amount?: number;
}> {
  const supabase = createClient();

  // Get event details
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

  // Get user's membership
  const membership = await getUserMembership(userId);

  // Check if user has already registered for this event
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

  // Event is free
  if (!event.price || event.price === 0) {
    return {
      canJoin: true,
      requiresPayment: false,
    };
  }

  // Event requires membership
  if (event.requires_membership && !membership.isPaid) {
    return {
      canJoin: false,
      reason: "This event requires a monthly membership",
      requiresPayment: false,
    };
  }

  // Event is free for members and user has active paid membership
  if (event.free_for_members && membership.isPaid && membership.isActive) {
    return {
      canJoin: true,
      requiresPayment: false,
    };
  }

  // User needs to pay for this event
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
        "Email & SMS notifications",
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
  status: MembershipStatus
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
