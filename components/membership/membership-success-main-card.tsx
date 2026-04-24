import { MembershipSuccessBenefitsBlock } from "@/components/membership/membership-success-benefits-block";
import { MembershipSuccessCtaRow } from "@/components/membership/membership-success-cta-row";
import { MembershipSuccessHeadline } from "@/components/membership/membership-success-headline";
import { Card, CardContent } from "@/components/ui/card";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  tier: MembershipTierRow;
};

export function MembershipSuccessMainCard({ tier }: Props) {
  return (
    <Card className="max-w-2xl mx-auto border-primary">
      <CardContent className="p-12 text-center">
        <MembershipSuccessHeadline tier={tier} />
        <MembershipSuccessBenefitsBlock tier={tier} />
        <MembershipSuccessCtaRow />
        <p className="text-sm text-muted-foreground mt-6">
          You&apos;ll receive a confirmation email with your receipt shortly.
        </p>
      </CardContent>
    </Card>
  );
}
