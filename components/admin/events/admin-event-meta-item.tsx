import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function AdminEventMetaItem({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </div>
  );
}
