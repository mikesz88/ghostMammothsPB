"use client";

import { useCallback, useState } from "react";

import { runMembershipCheckoutSubmitFlow } from "@/lib/hooks/membership-checkout-submit-flow";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

export function useMembershipCheckoutSubmit(tier: MembershipTierRow) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const submit = useCallback(() => {
    void runMembershipCheckoutSubmitFlow(tier, setCheckoutLoading);
  }, [tier]);

  return { checkoutLoading, submit };
}
