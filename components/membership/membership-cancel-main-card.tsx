import { MembershipCancelActions } from "@/components/membership/membership-cancel-actions";
import { MembershipCancelIconBlock } from "@/components/membership/membership-cancel-icon-block";
import { Card, CardContent } from "@/components/ui/card";

export function MembershipCancelMainCard() {
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-12 text-center">
        <MembershipCancelIconBlock />
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Checkout Cancelled
        </h1>
        <p className="text-muted-foreground mb-8">
          Your membership upgrade was cancelled. No charges were made.
        </p>
        <MembershipCancelActions />
      </CardContent>
    </Card>
  );
}
