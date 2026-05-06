
import { buildUserMembershipFromRow } from "@/lib/membership/build-user-membership-from-row";
import { fetchTierByMembershipStatusLabel } from "@/lib/membership/fetch-tier-by-membership-status-label";
import { createClient } from "@/lib/supabase/client";

import type { AppSupabaseClient } from "@/lib/membership/supabase-client-type";
import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

type TierShape = {
  name: string;
  display_name: string;
  price: number;
  billing_period: string;
};

type MembershipWithTier = {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  tier: TierShape | null;
};

async function loadMembershipAndUserLabel(
  supabase: AppSupabaseClient,
  userId: string,
) {
  return Promise.all([
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
}

async function freeMemberInfo(
  supabase: AppSupabaseClient,
): Promise<UserMembershipInfo> {
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

async function paidMemberWithoutRow(
  supabase: AppSupabaseClient,
  statusLabel: string,
): Promise<UserMembershipInfo> {
  const tier = await fetchTierByMembershipStatusLabel(supabase, statusLabel);

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

async function whenNoMembershipRow(
  supabase: AppSupabaseClient,
  statusLabel: string,
  usersTableSaysPaid: boolean,
): Promise<UserMembershipInfo> {
  if (usersTableSaysPaid) {
    return paidMemberWithoutRow(supabase, statusLabel);
  }
  return freeMemberInfo(supabase);
}

async function whenLinkedTierFreeButUserPaid(
  supabase: AppSupabaseClient,
  membership: MembershipWithTier,
  statusLabel: string,
): Promise<UserMembershipInfo> {
  const correctedTier = await fetchTierByMembershipStatusLabel(
    supabase,
    statusLabel,
  );

  if (correctedTier && correctedTier.name !== "free") {
    return buildUserMembershipFromRow(correctedTier, membership);
  }

  return {
    ...buildUserMembershipFromRow(
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

async function whenMembershipRowPresent(
  supabase: AppSupabaseClient,
  membership: MembershipWithTier,
  statusLabel: string,
  usersTableSaysPaid: boolean,
): Promise<UserMembershipInfo> {
  const joinedTier = membership.tier as TierShape;
  const linkedTierIsFree = joinedTier.name === "free";

  if (linkedTierIsFree && usersTableSaysPaid) {
    return whenLinkedTierFreeButUserPaid(supabase, membership, statusLabel);
  }

  return buildUserMembershipFromRow(joinedTier, membership);
}

/**
 * Get user's current membership information
 */
export async function getUserMembership(
  userId: string,
  supabaseClient?: AppSupabaseClient,
): Promise<UserMembershipInfo> {
  const supabase = supabaseClient ?? createClient();

  const [{ data: membership }, { data: userData }] =
    await loadMembershipAndUserLabel(supabase, userId);

  const statusLabel = userData?.membership_status?.trim() ?? "";
  const usersTableSaysPaid = statusLabel !== "" && statusLabel !== "free";

  if (!membership || !membership.tier) {
    return whenNoMembershipRow(supabase, statusLabel, usersTableSaysPaid);
  }

  return whenMembershipRowPresent(
    supabase,
    membership as MembershipWithTier,
    statusLabel,
    usersTableSaysPaid,
  );
}
