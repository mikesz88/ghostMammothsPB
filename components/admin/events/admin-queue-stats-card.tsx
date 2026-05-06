import { AdminQueueMetricCell } from "@/components/admin/events/admin-queue-metric-cell";
import { Card, CardContent } from "@/components/ui/card";

export function AdminQueueStatsCard({ waitingCount }: { waitingCount: number }) {
  const estWaitMinutes =
    waitingCount > 0 ? Math.ceil((waitingCount / 4) * 15) : 0;
  return (
    <Card className="border-border mb-4">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <AdminQueueMetricCell value={waitingCount} label="In Queue" />
          <AdminQueueMetricCell
            value={Math.ceil(waitingCount / 4)}
            label="Full Games"
          />
          <AdminQueueMetricCell value={`${estWaitMinutes}m`} label="Est. Wait" />
        </div>
      </CardContent>
    </Card>
  );
}
