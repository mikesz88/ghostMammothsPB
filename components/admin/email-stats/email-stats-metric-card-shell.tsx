import { Card, CardContent } from "@/components/ui/card";

import type { ReactNode } from "react";


export function EmailStatsMetricCardShell({ children }: { children: ReactNode }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}
