import { Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function AdminQueueEmptyCard() {
  return (
    <Card className="border-border">
      <CardContent className="p-12 text-center">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No players in queue</p>
      </CardContent>
    </Card>
  );
}
