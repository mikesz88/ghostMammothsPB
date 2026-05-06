import type { ReactNode } from "react";

export function EmailStatsMetricCardText({
  label,
  value,
  valueClassName,
  footer,
}: {
  label: string;
  value: number;
  valueClassName?: string;
  footer?: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-3xl font-bold ${valueClassName ?? "text-foreground"}`}>
        {value || 0}
      </p>
      {footer}
    </div>
  );
}
