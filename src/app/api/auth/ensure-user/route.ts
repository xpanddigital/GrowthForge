import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// POST /api/auth/ensure-user
// Ensures a public.users row + agency exists for the authenticated user.
// For new signups: creates a new agency for the user (multi-tenant SaaS).
// For existing users: returns their current status.
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role to bypass RLS for user creation
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user row already exists
    const { data: existingUser } = await adminClient
      .from("users")
      .select("id, agency_id")
      .eq("id", user.id)
      .single();

    if (existingUser) {
      return NextResponse.json({ status: "exists", agency_id: existingUser.agency_id });
    }

    // Parse optional body for agency details (from onboarding flow)
    let agencyName: string | null = null;
    let agencySlug: string | null = null;
    try {
      const body = await request.json();
      agencyName = body.agency_name || null;
      agencySlug = body.agency_slug || null;
    } catch {
      // No body — auto-create agency from user info
    }

    // Check if user was invited to an existing agency (via user_metadata)
    const invitedAgencyId = user.user_metadata?.invited_agency_id;
    const invitedRole = user.user_metadata?.invited_role || "member";

    if (invitedAgencyId) {
      // Join existing agency as invited member
      const { error: insertError } = await adminClient.from("users").insert({
        id: user.id,
        agency_id: invitedAgencyId,
        email: user.email!,
        full_name: user.user_metadata?.full_name || null,
        role: invitedRole,
      });

      if (insertError && insertError.code !== "23505") {
        throw insertError;
      }

      return NextResponse.json({ status: "created", agency_id: invitedAgencyId });
    }

    // Create a new agency for this user
    const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "My Agency";
    const finalName = agencyName || `${fullName}'s Agency`;
    const baseSlug = agencySlug || generateSlug(finalName);

    // Ensure unique slug
    let slug = baseSlug;
    let slugSuffix = 0;
    while (true) {
      const { data: existing } = await adminClient
        .from("agencies")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!existing) break;
      slugSuffix++;
      slug = `${baseSlug}-${slugSuffix}`;
    }

    // Create agency with starter defaults (no subscription yet)
    const { data: newAgency, error: agencyError } = await adminClient
      .from("agencies")
      .insert({
        name: finalName,
        slug,
        owner_email: user.email!,
        plan: "starter",
        credits_balance: 0, // Credits granted after plan selection + Stripe checkout
        max_clients: 5,
        max_keywords_per_client: 50,
        is_platform_owner: false,
        is_active: true,
      })
      .select("id")
      .single();

    if (agencyError || !newAgency) {
      throw new Error(`Failed to create agency: ${agencyError?.message || "Unknown"}`);
    }

    // Create user row linked to the new agency
    const { error: insertError } = await adminClient.from("users").insert({
      id: user.id,
      agency_id: newAgency.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
      role: "agency_owner",
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ status: "exists", agency_id: newAgency.id });
      }
      throw insertError;
    }

    return NextResponse.json({
      status: "created",
      agency_id: newAgency.id,
      is_new_agency: true,
    });
  } catch (error) {
    console.error("ensure-user error:", error);
    return NextResponse.json(
      { error: "Failed to ensure user" },
      { status: 500 }
    );
  }
}
