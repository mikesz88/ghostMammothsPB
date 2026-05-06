import { Button } from "@/components/ui/button";

type Props = {
  actionLoading: boolean;
  onReactivate: () => void;
};

export function SettingsMembershipReactivateButton({
  actionLoading,
  onReactivate,
}: Props) {
  return (
    <Button
      variant="default"
      className="flex-1"
      onClick={onReactivate}
      disabled={actionLoading}
    >
      Reactivate Membership
    </Button>
  );
}
