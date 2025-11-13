import { createClient } from "@/lib/supabase/client";
import type { MembershipStatus } from "@/lib/types-membership";

export interface UserMembershipInfo {
  status: MembershipStatus;
  tierName: string;
  tierDisplayName: string;
  tierPrice: number;
  tierBillingPeriod: string;
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
    // No membership found in user_memberships, check users.membership_status as fallback
    const { data: userData } = await supabase
      .from("users")
      .select("membership_status")
      .eq("id", userId)
      .single();

    if (userData?.membership_status && userData.membership_status !== "free") {
      // User has membership_status set, fetch that tier
      // Try to match by name first, then by display_name (in case display_name was stored)
      const { data: tiers } = await supabase
        .from("membership_tiers")
        .select("*")
        .or(
          `name.eq.${userData.membership_status},display_name.eq.${userData.membership_status}`
        );

      const tier = tiers?.[0];

      if (tier) {
        return {
          status: "active",
          tierName: tier.name,
          tierDisplayName: tier.display_name,
          tierPrice: tier.price,
          tierBillingPeriod: tier.billing_period,
          isActive: true,
          isPaid: tier.price > 0,
        };
      }
    }

    // Truly no membership found, fetch the free tier from database
    const { data: freeTier } = await supabase
      .from("membership_tiers")
      .select("*")
      .eq("name", "free")
      .single();

    return {
      status: "free",
      tierName: "free",
      tierDisplayName: freeTier?.display_name || "Free Member",
      tierPrice: freeTier?.price || 0,
      tierBillingPeriod: freeTier?.billing_period || "free",
      isActive: true,
      isPaid: false,
    };
  }

  const isActive =
    membership.status === "active" || membership.status === "trialing";
  const isPaid = membership.tier.price > 0; // Any tier with price > 0 is paid

  return {
    status: membership.status as MembershipStatus,
    tierName: membership.tier.name,
    tierDisplayName: membership.tier.display_name,
    tierPrice: membership.tier.price,
    tierBillingPeriod: membership.tier.billing_period,
    isActive,
    isPaid,
    currentPeriodEnd: membership.current_period_end
      ? new Date(membership.current_period_end)
      : undefined,
    cancelAtPeriodEnd: membership.cancel_at_period_end || undefined,
  };
}

/**
 * Check if user can join an event based on membership
 */
export async function canUserJoinEvent(
  _userId: string,
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
    .select("id")
    .eq("id", eventId)
    .single();

  if (!event) {
    return {
      canJoin: false,
      reason: "Event not found",
      requiresPayment: false,
    };
  }

  return {
    canJoin: true,
    requiresPayment: false,
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
    annual: {
      displayName: "Annual Member",
      description: "All the perks with two months free",
      color: "purple",
      features: [
        "Unlimited event access",
        "Priority queue position",
        "Exclusive events access",
        "Merchandise discounts",
        "Special member surprises",
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
