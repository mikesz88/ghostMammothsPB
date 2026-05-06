import { Button } from "@/components/ui/button";

type Props = {
  displayName: string;
};

export function MembershipMarketingTierCtaDowngrade({
  displayName,
}: Props) {
  return (
    <Button variant="outline" className="w-full" size="lg" disabled>
      Downgrade to {displayName}
    </Button>
  );
}
