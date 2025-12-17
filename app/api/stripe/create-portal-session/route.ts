import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCustomerPortalSession } from "@/lib/stripe/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user's Stripe customer ID from user_memberships
    let { data: membership } = await supabase
      .from("user_memberships")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    // If not in user_memberships, try to sync from users table
    if (!membership?.stripe_customer_id) {
      console.log(
        "Stripe customer ID not in user_memberships, checking users table..."
      );

      const { data: userData } = await supabase
        .from("users")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();

      if (userData?.stripe_customer_id) {
        console.log("Found in users table, syncing to user_memberships...");

        // Sync it to user_memberships
        await supabase
          .from("user_memberships")
          .update({ stripe_customer_id: userData.stripe_customer_id })
          .eq("user_id", user.id);

        // Use the synced customer ID
        membership = { stripe_customer_id: userData.stripe_customer_id };
      }
    }

    if (!membership?.stripe_customer_id) {
      console.error("No Stripe customer ID found for user:", user.id);
      return NextResponse.json(
        {
          error:
            "No Stripe customer found. Your subscription may not have been created through Stripe.",
        },
        { status: 404 }
      );
    }

    console.log(
      "Opening billing portal for customer:",
      membership.stripe_customer_id
    );

    // Create portal session with dynamic base URL
    // Prioritize NEXT_PUBLIC_URL environment variable for production
    const host = request.headers.get("host");
    const protocol =
      request.headers.get("x-forwarded-proto") ||
      (process.env.NODE_ENV === "development" ? "http" : "https");
    const baseUrl =
      process.env.NEXT_PUBLIC_URL || (host ? `${protocol}://${host}` : null);

    if (!baseUrl) {
      console.error(
        "Unable to determine base URL - NEXT_PUBLIC_URL environment variable or host header required"
      );
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log("Creating portal session with:", {
      customerId: membership.stripe_customer_id,
      returnUrl: `${baseUrl}/settings/membership`,
    });

    const { session, error } = await createCustomerPortalSession(
      membership.stripe_customer_id,
      `${baseUrl}/settings/membership`
    );

    if (error || !session) {
      console.error("❌ Error creating portal session:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      return NextResponse.json(
        {
          error: "Failed to create portal session",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }

    console.log("✅ Portal session created successfully:", session.id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error in create-portal-session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
