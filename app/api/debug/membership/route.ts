import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Debug endpoint to check membership status
// Access at: /api/debug/membership
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check user_memberships table
    const { data: userMembership, error: umError } = await supabase
      .from("user_memberships")
      .select(
        `
        *,
        tier:membership_tiers(*)
      `
      )
      .eq("user_id", user.id)
      .single();

    // Check users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("membership_status, stripe_customer_id")
      .eq("id", user.id)
      .single();

    // Get all available tiers
    const { data: allTiers } = await supabase
      .from("membership_tiers")
      .select("id, name, display_name, price, is_active")
      .order("sort_order");

    return NextResponse.json({
      userId: user.id,
      userEmail: user.email,
      userMembershipsTable: {
        exists: !!userMembership,
        data: userMembership,
        error: umError?.message,
      },
      usersTable: {
        membership_status: userData?.membership_status,
        stripe_customer_id: userData?.stripe_customer_id,
        error: userError?.message,
      },
      availableTiers: allTiers,
      diagnosis: {
        hasUserMembershipsRecord: !!userMembership,
        hasMembershipStatusSet:
          !!userData?.membership_status &&
          userData.membership_status !== "free",
        hasStripeCustomerId: !!userData?.stripe_customer_id,
        tierInUserMemberships: userMembership?.tier?.name || "N/A",
        tierInUsersTable: userData?.membership_status || "N/A",
      },
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
