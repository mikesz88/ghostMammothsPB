import { Badge } from "@/components/ui/badge";

export function EmailStatsFailedTypeCell({ type }: { type: string }) {
  return (
    <td className="p-3">
      <Badge variant="outline">{type}</Badge>
    </td>
  );
}
