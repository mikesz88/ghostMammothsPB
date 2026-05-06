import { SelectContent, SelectItem } from "@/components/ui/select";

const COURT_OPTIONS = ["1", "2", "3", "4", "5", "6", "8", "10"] as const;

export function TestControlCourtCountOptions() {
  return (
    <SelectContent>
      {COURT_OPTIONS.map((n) => (
        <SelectItem key={n} value={n}>
          {n} Court{n === "1" ? "" : "s"}
        </SelectItem>
      ))}
    </SelectContent>
  );
}
