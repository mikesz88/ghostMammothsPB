import type Stripe from "stripe";

export type VerifyPaidMembershipCheckoutFailure = {
  error: string;
  status: number;
};

export type VerifyPaidMembershipCheckoutSuccess = {
  tierId: string;
  tierName: string;
  customerId: string;
  subscriptionId: string | null;
};

export type VerifyPaidMembershipCheckoutResult =
  | { ok: true; data: VerifyPaidMembershipCheckoutSuccess }
  | { ok: false; failure: VerifyPaidMembershipCheckoutFailure };

export type ValidCheckoutSessionContext = {
  userId: string;
  session: Stripe.Checkout.Session;
  meta: { tierId: string; tierName: string };
  tierStub: { name: string };
};
