"use client";

import { MembershipCheckoutPageMain } from "@/components/membership/membership-checkout-page-main";
import { MembershipCheckoutPageShell } from "@/components/membership/membership-checkout-page-shell";
import { useMembershipCheckoutSubmit } from "@/lib/hooks/use-membership-checkout-submit";

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
