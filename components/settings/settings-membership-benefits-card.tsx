import { SettingsMembershipBenefitLines } from "@/components/settings/settings-membership-benefit-lines";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

export function SettingsMembershipBenefitsCard({
  membership,
}: {
  membership: UserMembershipInfo;
}) {
  if (!membership.isPaid) return null;
  return (
    <Card className="border-border mb-6">
      <CardHeader>
        <CardTitle className="text-foreground">
          Your {membership.tierDisplayName} Benefits
        </CardTitle>
        <CardDescription>What&apos;s included in your membership</CardDescription>
      </CardHeader>
      <CardContent>
        <SettingsMembershipBenefitLines />
      </CardContent>
    </Card>
  );
}
