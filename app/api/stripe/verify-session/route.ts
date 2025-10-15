import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify the session belongs to this user
    if (session.metadata?.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to this session" },
        { status: 403 }
      );
    }

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const tierId = session.metadata?.tier_id;
    const tierName = session.metadata?.tier_name;

    if (!tierId || !tierName) {
      return NextResponse.json(
        { error: "Missing tier information in session" },
        { status: 400 }
      );
    }

    // Verify tier exists in database
    const { data: tier, error: tierError } = await supabase
      .from("membership_tiers")
      .select("id, name, display_name")
      .eq("id", tierId)
      .single();

    if (tierError || !tier) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Get subscription details for period dates
    let currentPeriodStart, currentPeriodEnd;
    let subscriptionId = session.subscription as string | null;
    const customerId = session.customer as string;

    console.log("Session data:", {
      customer: customerId,
      subscription: subscriptionId,
      mode: session.mode,
      payment_status: session.payment_status,
    });

    if (session.subscription) {
      try {
        const { stripe } = await import("@/lib/stripe/server");
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId!
        );
        currentPeriodStart = new Date(
          (subscription as any).current_period_start * 1000
        ).toISOString();
        currentPeriodEnd = new Date(
          (subscription as any).current_period_end * 1000
        ).toISOString();
        console.log("✅ Subscription details retrieved:", {
          id: subscription.id,
          status: subscription.status,
          periodStart: currentPeriodStart,
          periodEnd: currentPeriodEnd,
        });
      } catch (err) {
        console.error("❌ Error fetching subscription:", err);
      }
    } else {
      console.warn(
        "⚠️ No subscription ID in session - this is unusual for subscription checkout"
      );
    }

    console.log("About to upsert user_memberships:", {
      user_id: user.id,
      tier_id: tierId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    });

    // Immediately update user membership (webhook will also do this as backup)
    const { error: membershipError } = await supabase
      .from("user_memberships")
      .upsert(
        {
          user_id: user.id,
          tier_id: tierId,
          status: "active",
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (membershipError) {
      console.error("Error updating membership:", membershipError);
      // Don't fail the request, webhook will handle it
    } else {
      console.log(
        "✅ user_memberships record created/updated for user:",
        user.id
      );
    }

    // Update user's membership_status
    const { error: userError } = await supabase
      .from("users")
      .update({
        membership_status: tier.name,
        stripe_customer_id: session.customer as string,
      })
      .eq("id", user.id);

    if (userError) {
      console.error("Error updating users table:", userError);
    } else {
      console.log("✅ users.membership_status updated to:", tier.name);
    }

    console.log("Session verified for user:", user.id, "Tier:", tier.name);

    return NextResponse.json({
      tier_id: tierId,
      tier_name: tierName,
      customer_id: session.customer,
      subscription_id: session.subscription,
    });
  } catch (error) {
    console.error("Error in verify-session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
