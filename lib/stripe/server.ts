import Stripe from "stripe";

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
  typescript: true,
});

// Helper function to create a checkout session for membership
export async function createMembershipCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
    });

    return { session, error: null };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { session: null, error };
  }
}

// Helper function to create a checkout session for single event
export async function createEventCheckoutSession(
  userId: string,
  userEmail: string,
  eventId: string,
  eventName: string,
  amount: number,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Event: ${eventName}`,
              description: "Single event entry fee",
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
        event_id: eventId,
        payment_type: "event",
      },
    });

    return { session, error: null };
  } catch (error) {
    console.error("Error creating event checkout session:", error);
    return { session: null, error };
  }
}

// Helper function to cancel a subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return { subscription, error: null };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return { subscription: null, error };
  }
}

// Helper function to reactivate a subscription
export async function reactivateSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return { subscription, error: null };
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    return { subscription: null, error };
  }
}

// Helper function to get customer portal URL
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return { session, error: null };
  } catch (error) {
    console.error("Error creating portal session:", error);
    return { session: null, error };
  }
}
