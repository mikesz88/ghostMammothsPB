"use client";

import { MembershipCheckoutPageMain } from "@/components/membership/checkout/membership-checkout-page-main";
import { MembershipCheckoutPageShell } from "@/components/membership/checkout/membership-checkout-page-shell";
import { useMembershipCheckoutSubmit } from "@/lib/hooks/membership/use-membership-checkout-submit";

import type { MembershipCheckoutPageClientProps } from "@/lib/membership/membership-checkout-page-types";

export function MembershipCheckoutPageClient({
  tier,
}: MembershipCheckoutPageClientProps) {
  const { checkoutLoading, submit } = useMembershipCheckoutSubmit(tier);

  return (
    <MembershipCheckoutPageShell>
      <MembershipCheckoutPageMain
        tier={tier}
        checkoutLoading={checkoutLoading}
        onCheckout={submit}
      />
    </MembershipCheckoutPageShell>
  );
}
