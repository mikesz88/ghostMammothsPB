import { MembershipSuccessMainCard } from "@/components/membership/membership-success-main-card";
import { MembershipSuccessPageShell } from "@/components/membership/membership-success-page-shell";

import type { MembershipSuccessPageClientProps } from "@/lib/membership/membership-success-page-types";

export function MembershipSuccessPageClient({
  tier,
}: MembershipSuccessPageClientProps) {
  return (
    <MembershipSuccessPageShell>
      <MembershipSuccessMainCard tier={tier} />
    </MembershipSuccessPageShell>
  );
}
