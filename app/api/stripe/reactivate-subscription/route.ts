import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reactivateSubscription } from "@/lib/stripe/server";

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
    const { data: membership } = await supabase
      .from("user_memberships")
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (!membership?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // Reactivate the subscription in Stripe
    const { subscription, error } = await reactivateSubscription(
      membership.stripe_subscription_id
    );

    if (error || !subscription) {
      console.error("Error reactivating subscription:", error);
      return NextResponse.json(
        { error: "Failed to reactivate subscription" },
        { status: 500 }
      );
    }

    // Update in database
    await supabase
      .from("user_memberships")
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in reactivate-subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
