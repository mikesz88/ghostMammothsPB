import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AdminUsersPageToolbar() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          User Management
        </h1>
        <p className="text-muted-foreground">
          Manage users and admin permissions
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link href="/admin">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </Link>
      </Button>
    </div>
  );
}
