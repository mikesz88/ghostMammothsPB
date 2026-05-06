import { redirect } from "next/navigation";

import { MembershipCheckoutPageClient } from "@/components/membership/membership-checkout-page-client";
import { loadMembershipCheckoutPageData } from "@/lib/membership/load-membership-checkout-page-data";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier: tierParam } = await searchParams;
  const tierId = tierParam?.trim() ?? "";
  if (!tierId) {
    redirect("/membership");
  }
  const result = await loadMembershipCheckoutPageData(tierId);
  if (!result.ok) {
    redirect("/membership");
  }
  return <MembershipCheckoutPageClient tier={result.tier} />;
}
