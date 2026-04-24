import { MembershipMarketingCommunityPerks } from "@/components/membership/membership-marketing-community-perks";
import { Card, CardContent } from "@/components/ui/card";

export function MembershipMarketingCommunityCard() {
  return (
    <div className="max-w-3xl mx-auto mb-10">
      <Card className="border-border bg-card">
        <CardContent className="p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Community Fan Club
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            Community Fan Club is the inner circle of Ghost Mammoth — the early
            believers who don&apos;t just play, they build the culture.
            It&apos;s for the people who show up consistently, bring new players,
            create the vibe, and help shape what we&apos;re becoming.
          </p>
          <p className="text-muted-foreground font-medium leading-relaxed mb-6">
            Not just members. Stakeholders in the movement.
          </p>
          <MembershipMarketingCommunityPerks />
        </CardContent>
      </Card>
    </div>
  );
}
