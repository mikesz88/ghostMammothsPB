import { MembershipCheckoutBackLink } from "@/components/membership/membership-checkout-back-link";
import { MembershipCheckoutOrderSummaryCard } from "@/components/membership/membership-checkout-order-summary-card";
import { MembershipCheckoutPageHeader } from "@/components/membership/membership-checkout-page-header";
import { MembershipCheckoutSecurePaymentCard } from "@/components/membership/membership-checkout-secure-payment-card";
import { MembershipCheckoutSubmitButton } from "@/components/membership/membership-checkout-submit-button";

import type { MembershipCheckoutPageClientProps } from "@/lib/membership/membership-checkout-page-types";

type Props = MembershipCheckoutPageClientProps & {
  checkoutLoading: boolean;
  onCheckout: () => void;
};

export function MembershipCheckoutPageMain({
  tier,
  checkoutLoading,
  onCheckout,
}: Props) {
  return (
    <div className="max-w-2xl mx-auto">
      <MembershipCheckoutPageHeader tier={tier} />
      <MembershipCheckoutOrderSummaryCard tier={tier} />
      <MembershipCheckoutSecurePaymentCard />
      <MembershipCheckoutSubmitButton
        checkoutLoading={checkoutLoading}
        onSubmit={onCheckout}
      />
      <p className="text-center text-sm text-muted-foreground mt-4">
        You&apos;ll be redirected to Stripe&apos;s secure checkout page
      </p>
      <MembershipCheckoutBackLink />
    </div>
  );
}
