"use client";

import { toast } from "sonner";

import { postMembershipCheckoutCreateSessionRequest } from "@/lib/membership/membership-checkout-create-session-request";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

function requireStripePriceId(tier: MembershipTierRow): string | null {
  const priceId = tier.stripe_price_id;
  if (!priceId) {
    toast.error("Invalid membership plan");
    return null;
  }
  return priceId;
}

async function redirectToStripeCheckoutSession(
  priceId: string,
  tierId: string,
): Promise<boolean> {
  const { url, error } = await postMembershipCheckoutCreateSessionRequest(
    priceId,
    tierId,
  );
  if (error) {
    toast.error("Failed to create checkout session", { description: error });
    return false;
  }
  if (url) {
    window.location.href = url;
    return true;
  }
  return false;
}

export async function runMembershipCheckoutSubmitFlow(
  tier: MembershipTierRow,
  setCheckoutLoading: (v: boolean) => void,
) {
  const priceId = requireStripePriceId(tier);
  if (!priceId) {
    return;
  }
  setCheckoutLoading(true);
  try {
    const redirected = await redirectToStripeCheckoutSession(priceId, tier.id);
    if (!redirected) {
      setCheckoutLoading(false);
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    toast.error("An unexpected error occurred", {
      description: "Please try again.",
    });
    setCheckoutLoading(false);
  }
}
