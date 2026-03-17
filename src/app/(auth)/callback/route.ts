import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure user row exists in public.users table
      // This links the auth user to the correct agency
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Use service role to bypass RLS for user creation
        const adminClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Check if user row already exists
        const { data: existingUser } = await adminClient
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existingUser) {
          // Phase 1: Auto-assign to Xpand Digital agency
          // Phase 3: This will use invite tokens to assign to the correct agency
          const { data: defaultAgency } = await adminClient
            .from("agencies")
            .select("id")
            .eq("is_platform_owner", true)
            .single();

          if (defaultAgency) {
            await adminClient.from("users").insert({
              id: user.id,
              agency_id: defaultAgency.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || null,
              role: "agency_owner",
            });
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
