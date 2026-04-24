import { Button } from "@/components/ui/button";

const QUICK_ADD = [
  { size: 1, label: "Solo", cap: 1 },
  { size: 2, label: "Duo", cap: 2 },
  { size: 3, label: "Triple", cap: 3 },
  { size: 4, label: "Quad", cap: 4 },
] as const;

export function TestControlQuickAddButtons({
  loading,
  teamSizeCap,
  onAdd,
}: {
  loading: boolean;
  teamSizeCap: number;
  onAdd: (size: number) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {QUICK_ADD.map(({ size, label, cap }) => (
        <Button
          key={size}
          onClick={() => onAdd(size)}
          disabled={loading || teamSizeCap < cap}
          variant="outline"
          size="sm"
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
