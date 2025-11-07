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
      const { data: userData } = await supabase
        .from("users")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();

      if (userData?.stripe_customer_id) {
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

    // Create portal session with dynamic base URL
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const baseUrl = process.env.NEXT_PUBLIC_URL || `${protocol}://${host}`;

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

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error in create-portal-session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
