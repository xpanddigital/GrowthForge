import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

// POST /api/auth/ensure-user
// Ensures a public.users row exists for the authenticated user.
// Called after password login (which doesn't go through the callback route).
export async function POST() {
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
      .select("id")
      .eq("id", user.id)
      .single();

    if (existingUser) {
      return NextResponse.json({ status: "exists" });
    }

    // Phase 1: Auto-assign to Xpand Digital agency
    const { data: defaultAgency } = await adminClient
      .from("agencies")
      .select("id")
      .eq("is_platform_owner", true)
      .single();

    if (!defaultAgency) {
      return NextResponse.json(
        { error: "No default agency found" },
        { status: 500 }
      );
    }

    const { error: insertError } = await adminClient.from("users").insert({
      id: user.id,
      agency_id: defaultAgency.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
      role: "agency_owner",
    });

    if (insertError) {
      // Handle race condition — another request may have created the row
      if (insertError.code === "23505") {
        return NextResponse.json({ status: "exists" });
      }
      throw insertError;
    }

    return NextResponse.json({ status: "created" });
  } catch (error) {
    console.error("ensure-user error:", error);
    return NextResponse.json(
      { error: "Failed to ensure user" },
      { status: 500 }
    );
  }
}
