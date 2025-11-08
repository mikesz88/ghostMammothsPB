import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { stripe } from "@/lib/stripe/server";

export async function DELETE() {
  try {
    const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!publicUrl || !anonKey) {
      return NextResponse.json({
        success: false,
        error:
          "Account deletion is currently unavailable. Please contact support to remove your account.",
        disabled: true,
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      return NextResponse.json(
        {
          error:
            "Account deletion is currently unavailable. Please contact support to remove your account.",
        },
        { status: 503 }
      );
    }

    let supabaseAdmin = null;
    try {
      supabaseAdmin = createServiceRoleClient();
    } catch (error) {
      console.error("Failed to initialize Supabase service role client:", error);
    }
    const userId = user.id;

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error:
          "Account deletion is currently unavailable. Please contact support to remove your account.",
        disabled: true,
      });
    }

    // Cancel any active Stripe subscription before removing data
    const { data: membership } = await supabaseAdmin
      .from("user_memberships")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (membership?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(membership.stripe_subscription_id, {
          invoice_now: false,
          prorate: true,
        });
      } catch (error) {
        console.error("Error canceling Stripe subscription:", error);
        return NextResponse.json({
          success: false,
          error:
            "We were unable to cancel your billing subscription. Please contact support.",
        });
      }
    }

    // Remove or anonymize related data before deleting the user record
    const deleteOperations = [
      supabaseAdmin.from("queue_entries").delete().eq("user_id", userId),
      supabaseAdmin.from("event_registrations").delete().eq("user_id", userId),
      supabaseAdmin.from("user_memberships").delete().eq("user_id", userId),
      supabaseAdmin.from("email_logs").delete().eq("user_id", userId),
      supabaseAdmin
        .from("payments")
        .update({ user_id: null })
        .eq("user_id", userId),
      supabaseAdmin
        .from("court_assignments")
        .update({ player1_id: null })
        .eq("player1_id", userId),
      supabaseAdmin
        .from("court_assignments")
        .update({ player2_id: null })
        .eq("player2_id", userId),
      supabaseAdmin
        .from("court_assignments")
        .update({ player3_id: null })
        .eq("player3_id", userId),
      supabaseAdmin
        .from("court_assignments")
        .update({ player4_id: null })
        .eq("player4_id", userId),
      supabaseAdmin
        .from("court_assignments")
        .update({ player5_id: null })
        .eq("player5_id", userId),
      supabaseAdmin
        .from("court_assignments")
        .update({ player6_id: null })
        .eq("player6_id", userId),
      supabaseAdmin
        .from("court_assignments")
        .update({ player7_id: null })
        .eq("player7_id", userId),
      supabaseAdmin
        .from("court_assignments")
        .update({ player8_id: null })
        .eq("player8_id", userId),
    ];

    const results = await Promise.allSettled(deleteOperations);
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Error cleaning up user data:", result.reason);
      } else if (result.value.error) {
        console.error("Error cleaning up user data:", result.value.error);
      }
    });

    const { error: userTableError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    if (userTableError) {
      console.error("Error deleting user profile:", userTableError);
      return NextResponse.json({
        success: false,
        error: "Unable to delete user profile",
      });
    }

    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error("Error removing auth user:", authDeleteError);
      return NextResponse.json({
        success: false,
        error: "Unable to delete auth user",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({
      success: false,
      error: "Unable to delete account",
    });
  }
}
