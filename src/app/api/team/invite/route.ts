import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();

  // Verify the requesting user is authenticated and has permission
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("agency_id, role")
    .eq("id", user.id)
    .single();

  if (!userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Only owners and admins can invite
  if (!["platform_admin", "agency_owner", "agency_admin"].includes(userData.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { email, role } = await req.json();

  if (!email || !role) {
    return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
  }

  // Validate role
  const allowedRoles = ["agency_admin", "member", "viewer"];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Use service role client to invite user via Supabase Auth
  const serviceClient = await createServiceRoleClient();

  // Check if user already exists in this agency
  const { data: existingUser } = await serviceClient
    .from("users")
    .select("id")
    .eq("email", email)
    .eq("agency_id", userData.agency_id)
    .maybeSingle();

  if (existingUser) {
    return NextResponse.json({ error: "This user is already a member of your agency" }, { status: 409 });
  }

  // Invite user via Supabase Auth (sends an email with a magic link)
  const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(email, {
    data: {
      agency_id: userData.agency_id,
      role,
      invited_by: user.id,
    },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://mentionlayer.com"}/dashboard`,
  });

  if (inviteError) {
    // If user already has an auth account, just add them to the agency
    if (inviteError.message?.includes("already been registered")) {
      // Look up existing auth user by listing with email filter
      const { data: listData } = await serviceClient.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });
      const existingUser = listData?.users?.find((u) => u.email === email);
      if (existingUser) {
        const { error: insertError } = await serviceClient
          .from("users")
          .insert({
            id: existingUser.id,
            agency_id: userData.agency_id,
            email,
            role,
          });

        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ data: { status: "added", email } });
      }
    }

    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  // Create the user row in our users table so they're linked to the agency
  if (inviteData?.user) {
    await serviceClient.from("users").upsert({
      id: inviteData.user.id,
      agency_id: userData.agency_id,
      email,
      role,
    }, { onConflict: "id" });
  }

  return NextResponse.json({ data: { status: "invited", email } });
}
