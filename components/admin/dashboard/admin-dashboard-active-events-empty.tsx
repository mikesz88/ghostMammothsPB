import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AdminDashboardActiveEventsEmpty({
  onCreateClick,
}: {
  onCreateClick: () => void;
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-12 text-center">
        <p className="text-muted-foreground mb-4">No active events</p>
        <Button onClick={onCreateClick}>Create Your First Event</Button>
      </CardContent>
    </Card>
  );
}
