import { Header } from "@/components/ui/header";

import type { ReactNode } from "react";


export function MembershipCheckoutPageShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">{children}</div>
    </div>
  );
}
