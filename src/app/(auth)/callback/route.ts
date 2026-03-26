import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { syncProspectToGHL } from "@/lib/ghl/sync";

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
          .select("id, role, signup_source")
          .eq("id", user.id)
          .single();

        if (!existingUser) {
          // Phase 1: Auto-assign to Xpand Digital agency
          const { data: defaultAgency } = await adminClient
            .from("agencies")
            .select("id")
            .eq("is_platform_owner", true)
            .single();

          if (defaultAgency) {
            const signupSource = user.user_metadata?.signup_source || "direct";
            const isFreeAudit = signupSource === "free_audit";
            const companyName = user.user_metadata?.company_name || null;
            const websiteUrl = user.user_metadata?.website_url || null;

            // Insert user with appropriate role
            const { data: newUser } = await adminClient
              .from("users")
              .insert({
                id: user.id,
                agency_id: defaultAgency.id,
                email: user.email!,
                full_name: user.user_metadata?.full_name || null,
                role: isFreeAudit ? "prospect" : "agency_owner",
                signup_source: signupSource,
                company_name: companyName,
                website_url: websiteUrl,
              })
              .select("id")
              .single();

            // For free audit signups: auto-create a client record and sync to GHL
            if (isFreeAudit && newUser && companyName) {
              const slug = companyName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

              // Auto-create client
              await adminClient.from("clients").insert({
                agency_id: defaultAgency.id,
                name: companyName,
                slug: slug || "my-business",
                website_url: websiteUrl,
                brand_brief: `${companyName} — visit ${websiteUrl || "our website"} for more information.`,
                created_by_signup: true,
              });

              // Sync to GHL (fire-and-forget — don't block redirect)
              const fullName = user.user_metadata?.full_name || "";
              const nameParts = fullName.split(" ");
              syncProspectToGHL({
                email: user.email!,
                firstName: nameParts[0] || "",
                lastName: nameParts.slice(1).join(" ") || "",
                companyName,
                websiteUrl: websiteUrl || "",
              })
                .then((result) => {
                  if (result.contactId) {
                    // Store GHL contact ID on user record
                    adminClient
                      .from("users")
                      .update({ ghl_contact_id: result.contactId })
                      .eq("id", user.id)
                      .then(() => {});
                  }
                })
                .catch((err) => {
                  console.error("[Callback] GHL sync failed:", err);
                });
            }
          }

          // Redirect free audit signups to the setup wizard
          if (user.user_metadata?.signup_source === "free_audit") {
            return NextResponse.redirect(`${origin}/free-audit/setup`);
          }
        } else if (existingUser.signup_source === "free_audit" && existingUser.role === "prospect") {
          // Returning free audit user — send to setup or results
          return NextResponse.redirect(`${origin}/free-audit/setup`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
