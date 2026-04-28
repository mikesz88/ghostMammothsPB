import { Loader2 } from "lucide-react";

import { SiteHeader } from "@/components/ui/header/site-header";

export default async function MembershipSuccessLoading() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span className="text-muted-foreground">
            Confirming your subscription...
          </span>
        </div>
      </div>
    </div>
  );
}
