import { MembershipMarketingPageClient } from "@/components/membership/marketing/membership-marketing-page-client";
import { loadMembershipMarketingPageData } from "@/lib/membership/load-membership-marketing-page-data";

export default async function MembershipPage() {
  const data = await loadMembershipMarketingPageData();
  return <MembershipMarketingPageClient {...data} />;
}
