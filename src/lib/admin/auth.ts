import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Reusable guard for admin API routes.
 * Verifies the caller is a platform_admin and returns a service-role
 * Supabase client for cross-tenant queries.
 *
 * Usage:
 *   const { supabase, userId } = await requirePlatformAdmin();
 */
export async function requirePlatformAdmin() {
  const supabaseAuth = await createServerClient();

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    throw new AdminAuthError("Not authenticated", 401);
  }

  // Use service role to check role (avoids RLS)
  const supabase = createServiceRoleClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!dbUser || dbUser.role !== "platform_admin") {
    throw new AdminAuthError("Forbidden: platform_admin required", 403);
  }

  return { supabase, userId: user.id };
}

/**
 * Creates a service-role Supabase client that bypasses RLS.
 * Used by admin routes to query across all tenants.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export class AdminAuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Wraps an admin API handler with auth + error handling.
 * Returns proper NextResponse on auth failures.
 */
export function handleAdminError(error: unknown): NextResponse {
  if (error instanceof AdminAuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  console.error("[Admin API]", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
