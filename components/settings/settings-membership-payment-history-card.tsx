import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SettingsMembershipPaymentHistoryCard() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Payment History</CardTitle>
        <CardDescription>Your recent transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Payment history coming soon
        </p>
      </CardContent>
    </Card>
  );
}
