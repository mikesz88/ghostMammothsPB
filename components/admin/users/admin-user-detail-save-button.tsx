import { Save, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminUserDetailSaveButton({
  saving,
  onClick,
}: {
  saving: boolean;
  onClick: () => void;
}) {
  return (
    <Button onClick={onClick} disabled={saving} className="w-full">
      {saving ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </>
      )}
    </Button>
  );
}
