import { Header } from "@/components/ui/header";

import type { ReactNode } from "react";

export function MembershipSuccessPageShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-20">{children}</div>
    </div>
  );
}
