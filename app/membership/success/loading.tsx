import { Loader2 } from "lucide-react";

import { Header } from "@/components/ui/header";

export default function MembershipSuccessLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
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
