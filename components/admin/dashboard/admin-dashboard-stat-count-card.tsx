import { Card, CardContent } from "@/components/ui/card";

import type { LucideIcon } from "lucide-react";

function StatCountIconWrap({
  Icon,
  className,
}: {
  Icon: LucideIcon;
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

export function AdminDashboardStatCountCard({
  label,
  value,
  icon: Icon,
  iconWrapClassName,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  iconWrapClassName: string;
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          <StatCountIconWrap Icon={Icon} className={iconWrapClassName} />
        </div>
      </CardContent>
    </Card>
  );
}
