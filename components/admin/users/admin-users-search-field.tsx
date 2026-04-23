import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminUsersSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function AdminUsersSearchField({
  value,
  onChange,
}: AdminUsersSearchFieldProps) {
  return (
    <div className="mb-6">
      <Label htmlFor="user-search" className="sr-only">
        Search users
      </Label>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
        <Input id="user-search" type="text" placeholder="Search by name, email, or skill level..." value={value} onChange={(e) => onChange(e.target.value)} className="pl-10" />
      </div>
    </div>
  );
}
