import type { LucideIcon } from "lucide-react";

export function EmailStatsMetricCardIconWrap({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className: string;
}) {
  return (
    <div
      className={`w-12 h-12 rounded-lg flex items-center justify-center ${className}`}
    >
      <Icon className="w-6 h-6" />
    </div>
  );
}
