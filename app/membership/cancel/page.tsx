import { MembershipCancelMainCard } from "@/components/membership/cancel/membership-cancel-main-card";
import { MembershipCancelPageShell } from "@/components/membership/cancel/membership-cancel-page-shell";

export default async function MembershipCancelPage() {
  return (
    <MembershipCancelPageShell>
      <MembershipCancelMainCard />
    </MembershipCancelPageShell>
  );
}
