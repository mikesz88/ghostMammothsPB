import { Shield } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function MembershipCheckoutSecurePaymentCard() {
  return (
    <Card className="border-border mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground mb-1">Secure Payment</p>
            <p className="text-sm text-muted-foreground">
              Your payment information is encrypted and secure. We use Stripe
              for payment processing and never store your card details.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
