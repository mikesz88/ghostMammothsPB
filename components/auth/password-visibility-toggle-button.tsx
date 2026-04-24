import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  show: boolean;
  onToggle: () => void;
  ariaLabel: string;
};

export function PasswordVisibilityToggleButton({
  show,
  onToggle,
  ariaLabel,
}: Props) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
      onClick={onToggle}
      aria-label={ariaLabel}
    >
      {show ? (
        <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden />
      ) : (
        <Eye className="h-4 w-4 text-muted-foreground" aria-hidden />
      )}
    </Button>
  );
}
