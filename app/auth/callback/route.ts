import { createServerClient } from "@supabase/ssr";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/membership";

  if (code) {
    const cookieStore = await cookies();

    // Create redirect response first so we can attach session cookies to it.
    // Next.js may not merge cookies().set() with NextResponse.redirect() in all cases.
    const redirectUrl = `${origin}${next}`;
    const redirectResponse = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
              redirectResponse.cookies.set(name, value, { ...options, path: "/" });
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure user profile exists (e.g. after email confirmation)
      const supabaseAdmin = createServiceRoleClient();
      if (supabaseAdmin) {
        const user = data.user;
        await supabaseAdmin.from("users").upsert(
          {
            id: user.id,
            email: user.email ?? "",
            name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User",
            skill_level: user.user_metadata?.skill_level ?? "intermediate",
            phone: user.user_metadata?.phone ?? "",
            is_admin: false,
          },
          { onConflict: "id" }
        );
      }
      return redirectResponse;
    }

    if (error) {
      console.error("Auth callback error:", error.message);
    }
  }

  // Redirect to login with error if code exchange failed or no code
  return NextResponse.redirect(`${origin}/login?message=Could not authenticate`);
}
