import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cancelSubscription, stripe } from "@/lib/stripe/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user's subscription ID
    let { data: membership } = await supabase
      .from("user_memberships")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let subscriptionId = membership?.stripe_subscription_id;

    // If no subscription ID but we have customer ID, try to find it in Stripe
    if (!subscriptionId && membership?.stripe_customer_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: membership.stripe_customer_id,
          status: "active",
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          subscriptionId = subscriptions.data[0].id;
          // Update database with the subscription ID
          await supabase
            .from("user_memberships")
            .update({
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        }
      } catch (err) {
        console.error("Error fetching subscriptions from Stripe:", err);
      }
    }

    if (!subscriptionId) {
      console.error("No subscription ID found for user:", user.id);

      return NextResponse.json(
        {
          error:
            "No active subscription found. Your subscription may not have been created through Stripe, or the subscription ID was not recorded.",
        },
        { status: 404 }
      );
    }

    // Cancel the subscription in Stripe
    const { subscription, error } = await cancelSubscription(subscriptionId);

    if (error || !subscription) {
      console.error("Error cancelling subscription:", error);
      return NextResponse.json(
        { error: "Failed to cancel subscription" },
        { status: 500 }
      );
    }

    // Update in database
    await supabase
      .from("user_memberships")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in cancel-subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
