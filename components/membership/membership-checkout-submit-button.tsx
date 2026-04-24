import { CreditCard, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  checkoutLoading: boolean;
  onSubmit: () => void;
};

export function MembershipCheckoutSubmitButton({
  checkoutLoading,
  onSubmit,
}: Props) {
  return (
    <Button
      onClick={onSubmit}
      disabled={checkoutLoading}
      size="lg"
      className="w-full"
    >
      {checkoutLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Redirecting to checkout...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          Continue to Payment
        </>
      )}
    </Button>
  );
}
