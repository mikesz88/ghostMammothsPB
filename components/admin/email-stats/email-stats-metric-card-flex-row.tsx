import type { ReactNode } from "react";

export function EmailStatsMetricCardFlexRow({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      {left}
      {right}
    </div>
  );
}
