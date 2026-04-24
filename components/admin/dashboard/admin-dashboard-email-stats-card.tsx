import { Mail } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AdminDashboardEmailStatsCard() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Email Stats</p>
            <p className="text-lg font-semibold text-foreground">
              View Reports
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4" asChild>
          <Link href="/admin/email-stats">View Email Statistics</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
