import { CreditCard, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  actionLoading: boolean;
  onManageBilling: () => void;
};

export function SettingsMembershipManageBillingButton({
  actionLoading,
  onManageBilling,
}: Props) {
  return (
    <Button
      variant="outline"
      className="flex-1"
      onClick={onManageBilling}
      disabled={actionLoading}
    >
      {actionLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4 mr-2" />
      )}
      Manage Billing
    </Button>
  );
}
