import { Card, CardContent } from "@/components/ui/card";

import type { LucideIcon } from "lucide-react";


type AdminUsersStatCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  iconWrapClassName: string;
  iconClassName: string;
};

export function AdminUsersStatCard({
  label,
  value,
  icon: Icon,
  iconWrapClassName,
  iconClassName,
}: AdminUsersStatCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconWrapClassName}`}
          >
            <Icon className={`w-6 h-6 ${iconClassName}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
