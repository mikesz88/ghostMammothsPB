import { Gift } from "lucide-react";

type Props = {
  discountPct: number;
};

export function MembershipMarketingTierFeatureMerch({ discountPct }: Props) {
  return (
    <li className="flex items-start gap-2">
      <Gift className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <span className="text-muted-foreground">
        {discountPct}% discount on merchandise
      </span>
    </li>
  );
}
