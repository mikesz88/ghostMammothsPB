import { Check } from "lucide-react";

const BENEFIT_LINES = [
  "Free entry to all events",
  "Priority queue position",
  "Access to exclusive events",
  "10% merchandise discount",
] as const;

export function SettingsMembershipBenefitLines() {
  return (
    <ul className="space-y-3">
      {BENEFIT_LINES.map((line) => (
        <li key={line} className="flex items-center gap-2">
          <Check className="w-5 h-5 text-primary" />
          <span className="text-muted-foreground">{line}</span>
        </li>
      ))}
    </ul>
  );
}
