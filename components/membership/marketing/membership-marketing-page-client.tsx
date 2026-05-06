"use client";

import { MembershipMarketingPageMain } from "@/components/membership/marketing/membership-marketing-page-main";
import { MembershipMarketingPageShell } from "@/components/membership/marketing/membership-marketing-page-shell";

import type { MembershipMarketingPageClientProps } from "@/lib/membership/membership-marketing-page-types";

export function MembershipMarketingPageClient(
  props: MembershipMarketingPageClientProps,
) {
  return (
    <MembershipMarketingPageShell>
      <MembershipMarketingPageMain {...props} />
    </MembershipMarketingPageShell>
  );
}
