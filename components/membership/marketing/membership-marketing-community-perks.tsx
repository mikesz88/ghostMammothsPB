import { Check } from "lucide-react";

const PERKS = [
  "Exclusive merch drops",
  "Members-only events",
  "Discount on GM items",
  "Priority sign-ups",
  "Recognition as a Community Builder",
  "Directly fund free open-play sessions",
] as const;

export function MembershipMarketingCommunityPerks() {
  return (
    <>
      <p className="text-sm font-medium text-foreground mb-2">Perks:</p>
      <ul className="grid sm:grid-cols-2 gap-2 text-muted-foreground">
        {PERKS.map((perk) => (
          <li key={perk} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary shrink-0" />
            {perk}
          </li>
        ))}
      </ul>
    </>
  );
}
