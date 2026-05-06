import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  children: ReactNode;
};

export function MembershipCheckoutSummaryLine({ icon: Icon, children }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-primary" />
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}
