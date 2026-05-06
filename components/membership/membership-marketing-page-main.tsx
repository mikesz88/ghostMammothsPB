import { MembershipMarketingCommunityCard } from "@/components/membership/membership-marketing-community-card";
import { MembershipMarketingCurrentPlanBanner } from "@/components/membership/membership-marketing-current-plan-banner";
import { MembershipMarketingFaqSection } from "@/components/membership/membership-marketing-faq-section";
import { MembershipMarketingPageHeader } from "@/components/membership/membership-marketing-page-header";
import { MembershipMarketingTiersGrid } from "@/components/membership/membership-marketing-tiers-grid";
import { MembershipMarketingTiersLoadError } from "@/components/membership/membership-marketing-tiers-load-error";
import { MembershipMarketingValueSection } from "@/components/membership/membership-marketing-value-section";

import type { MembershipMarketingPageClientProps } from "@/lib/membership/membership-marketing-page-types";

export function MembershipMarketingPageMain({
  tiers,
  membership,
  tiersErrorMessage,
}: MembershipMarketingPageClientProps) {
  const monthlyTier = tiers.find((t) => t.billing_period === "monthly");
  return (
    <>
      <MembershipMarketingPageHeader />
      <MembershipMarketingTiersLoadError message={tiersErrorMessage} />
      <MembershipMarketingCurrentPlanBanner
        tiers={tiers}
        membership={membership}
      />
      <MembershipMarketingCommunityCard />
      <MembershipMarketingTiersGrid tiers={tiers} membership={membership} />
      <MembershipMarketingValueSection monthlyTier={monthlyTier} />
      <MembershipMarketingFaqSection />
    </>
  );
}
