import { Check } from "lucide-react";

type Props = {
  eventAccess?: string;
};

export function MembershipMarketingTierFeaturePayPerEvent({
  eventAccess,
}: Props) {
  if (eventAccess !== "pay_per_event") return null;
  return (
    <>
      <li className="flex items-start gap-2">
        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <span className="text-muted-foreground">Can join free events</span>
      </li>
      <li className="flex items-start gap-2">
        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <span className="text-muted-foreground">Pay per paid event</span>
      </li>
    </>
  );
}
