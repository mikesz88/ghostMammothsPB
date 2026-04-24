import { MembershipCheckoutOrderSummaryPriceRow } from "@/components/membership/membership-checkout-order-summary-price-row";
import { MembershipCheckoutSummaryFeatures } from "@/components/membership/membership-checkout-summary-features";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  tier: MembershipTierRow;
};

export function MembershipCheckoutOrderSummaryCard({ tier }: Props) {
  return (
    <Card className="border-border mb-6">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MembershipCheckoutOrderSummaryPriceRow tier={tier} />
        <MembershipCheckoutSummaryFeatures tier={tier} />
      </CardContent>
    </Card>
  );
}
