import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ReactNode } from "react";

export function TestControlsCardShell({ children }: { children: ReactNode }) {
  return (
    <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Test Mode Controls
        </CardTitle>
        <CardDescription>Quick actions for testing game flows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
