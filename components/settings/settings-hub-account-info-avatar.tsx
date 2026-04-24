import { User as UserIcon } from "lucide-react";

export function SettingsHubAccountInfoAvatar() {
  return (
    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
      <UserIcon className="w-8 h-8 text-primary" />
    </div>
  );
}
