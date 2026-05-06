import { Card, CardContent } from "@/components/ui/card";

import type { ReactNode } from "react";


type Props = {
  title: ReactNode;
  subtitle: string;
};

export function MembershipMarketingValueStatCard({ title, subtitle }: Props) {
  return (
    <Card className="border-border">
      <CardContent className="p-6 text-center">
        <p className="text-3xl font-bold text-foreground mb-2">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
