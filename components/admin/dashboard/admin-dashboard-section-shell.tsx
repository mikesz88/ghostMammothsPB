import type { ReactNode } from "react";

export function AdminDashboardSectionShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-4">{title}</h2>
      {children}
    </div>
  );
}
