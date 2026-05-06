import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TestControlsResetRow({
  loading,
  onReset,
}: {
  loading: boolean;
  onReset: () => void;
}) {
  return (
    <Button
      onClick={onReset}
      disabled={loading}
      variant="destructive"
      className="w-full"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Reset Event (Reload 8 Dummy Users)
    </Button>
  );
}
