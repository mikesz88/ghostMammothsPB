import { emailStatsTypeLabel } from "@/components/admin/email-stats/email-stats-type-label";
import { Badge } from "@/components/ui/badge";


export function EmailStatsBreakdownRow({
  type,
  count,
}: {
  type: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-3">
        <Badge variant="outline">{type}</Badge>
        <span className="text-sm text-muted-foreground">
          {emailStatsTypeLabel(type)}
        </span>
      </div>
      <span className="text-lg font-bold">{count}</span>
    </div>
  );
}
