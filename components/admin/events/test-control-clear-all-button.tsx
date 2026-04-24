import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TestControlClearAllButton({
  loading,
  onClearAll,
}: {
  loading: boolean;
  onClearAll: () => void;
}) {
  return (
    <Button onClick={onClearAll} disabled={loading} variant="outline" size="sm">
      <Trash2 className="w-4 h-4 mr-2" />
      Clear All
    </Button>
  );
}
