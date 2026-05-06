import { Calendar } from "lucide-react";

export function SettingsHubAccountInfoMemberSince({
  createdAt,
}: {
  createdAt: string;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">Member Since</p>
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm text-foreground">
          {new Date(createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
