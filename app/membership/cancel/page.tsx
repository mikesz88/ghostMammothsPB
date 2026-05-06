import { MembershipCancelMainCard } from "@/components/membership/membership-cancel-main-card";
import { MembershipCancelPageShell } from "@/components/membership/membership-cancel-page-shell";

export default async function MembershipCancelPage() {
  return (
    <MembershipCancelPageShell>
      <MembershipCancelMainCard />
    </MembershipCancelPageShell>
  );
}
