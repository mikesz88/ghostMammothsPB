import { Calendar, Trophy } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AdminUserDetailActivityStatsCard() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground text-lg">Activity Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Events Attended</span>
          </div>
          <span className="font-medium text-foreground">Coming soon</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Games Played</span>
          </div>
          <span className="font-medium text-foreground">Coming soon</span>
        </div>
      </CardContent>
    </Card>
  );
}
