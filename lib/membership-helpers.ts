import { createClient } from "@/lib/supabase/client";

import type { MembershipStatus } from "@/lib/types-membership";

type SupabaseBrowserClient = ReturnType<typeof createClient>;

/** Match `users.membership_status` to a row in `membership_tiers` by `name` or `display_name`. */
async function fetchTierByMembershipStatusLabel(
  supabase: SupabaseBrowserClient,
  label: string,
) {
  const { data: byName } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("name", label)
    .maybeSingle();

  if (byName) return byName;

  const { data: byDisplay } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("display_name", label)
    .maybeSingle();

  return byDisplay ?? null;
}

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
  userId: string,
): Promise<UserMembershipInfo> {
  const supabase = createClient();

  const [{ data: membership }, { data: userData }] = await Promise.all([
    supabase
      .from("user_memberships")
      .select(
        `
      *,
      tier:membership_tiers(*)
    `,
      )
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("users")
      .select("membership_status")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  const statusLabel = userData?.membership_status?.trim() ?? "";
  const usersTableSaysPaid = statusLabel !== "" && statusLabel !== "free";

  const buildFromUserMembershipRow = (
    tier: {
      name: string;
      display_name: string;
      price: number;
      billing_period: string;
    },
    membershipRow: {
      status: string;
      current_period_end: string | null;
      cancel_at_period_end: boolean | null;
    },
  ): UserMembershipInfo => {
    const isActive =
      membershipRow.status === "active" || membershipRow.status === "trialing";
    const isPaid = Number(tier.price) > 0;

    return {
      status: membershipRow.status as MembershipStatus,
      tierName: tier.name,
      tierDisplayName: tier.display_name,
      tierPrice: tier.price,
      tierBillingPeriod: tier.billing_period,
      isActive,
      isPaid,
      currentPeriodEnd: membershipRow.current_period_end
        ? new Date(membershipRow.current_period_end)
        : undefined,
      cancelAtPeriodEnd: membershipRow.cancel_at_period_end ?? undefined,
    };
  };

  if (!membership || !membership.tier) {
    if (usersTableSaysPaid) {
      const tier = await fetchTierByMembershipStatusLabel(
        supabase,
        statusLabel,
      );

      if (tier) {
        return {
          status: "active",
          tierName: tier.name,
          tierDisplayName: tier.display_name,
          tierPrice: tier.price,
          tierBillingPeriod: tier.billing_period,
          isActive: true,
          isPaid: Number(tier.price) > 0,
        };
      }

      return {
        status: "active",
        tierName: statusLabel,
        tierDisplayName: statusLabel,
        tierPrice: 0,
        tierBillingPeriod: "monthly",
        isActive: true,
        isPaid: true,
      };
    }

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

  const joinedTier = membership.tier as {
    name: string;
    display_name: string;
    price: number;
    billing_period: string;
  };

  const linkedTierIsFree = joinedTier.name === "free";

  if (linkedTierIsFree && usersTableSaysPaid) {
    const correctedTier = await fetchTierByMembershipStatusLabel(
      supabase,
      statusLabel,
    );

    if (correctedTier && correctedTier.name !== "free") {
      return buildFromUserMembershipRow(correctedTier, membership);
    }

    return {
      ...buildFromUserMembershipRow(
        {
          name: statusLabel,
          display_name: statusLabel,
          price: 0,
          billing_period: "monthly",
        },
        membership,
      ),
      isPaid: true,
    };
  }

  return buildFromUserMembershipRow(joinedTier, membership);
}

/**
 * Check if user can join an event based on membership
 */
export async function canUserJoinEvent(
  userId: string,
  eventId: string,
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
      reason: "This event requires a paid membership",
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
