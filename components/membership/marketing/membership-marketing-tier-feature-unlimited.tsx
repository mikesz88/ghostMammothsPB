import { Zap } from "lucide-react";

type Props = {
  eventAccess?: string;
};

export function MembershipMarketingTierFeatureUnlimited({
  eventAccess,
}: Props) {
  if (eventAccess !== "unlimited") return null;
  return (
    <li className="flex items-start gap-2">
      <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <span className="font-medium text-foreground">
        Free entry to ALL events
      </span>
    </li>
  );
}
