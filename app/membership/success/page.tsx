import { redirect } from "next/navigation";

import { MembershipSuccessPageClient } from "@/components/membership/membership-success-page-client";
import { loadMembershipSuccessPageData } from "@/lib/membership/load-membership-success-page-data";

export default async function MembershipSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionIdParam } = await searchParams;
  const sessionId = sessionIdParam?.trim() ?? "";
  if (!sessionId) {
    redirect("/membership");
  }
  const result = await loadMembershipSuccessPageData(sessionId);
  if (!result.ok) {
    redirect("/membership");
  }
  return <MembershipSuccessPageClient tier={result.tier} />;
}
