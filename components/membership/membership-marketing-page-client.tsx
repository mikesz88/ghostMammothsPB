"use client";

import { MembershipMarketingPageMain } from "@/components/membership/membership-marketing-page-main";
import { MembershipMarketingPageShell } from "@/components/membership/membership-marketing-page-shell";

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
