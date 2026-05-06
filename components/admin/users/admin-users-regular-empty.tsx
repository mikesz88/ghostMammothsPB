import { Card, CardContent } from "@/components/ui/card";

export function AdminUsersRegularEmpty() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-12 text-center">
        <p className="text-muted-foreground">No users found</p>
      </CardContent>
    </Card>
  );
}
