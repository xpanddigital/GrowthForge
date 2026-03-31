import { NextResponse } from "next/server";
import { requirePlatformAdmin, handleAdminError } from "@/lib/admin/auth";
import { PLAN_IDS } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { supabase } = await requirePlatformAdmin();

    const url = new URL(request.url);
    const plan = url.searchParams.get("plan");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "25", 10)));
    const sort = url.searchParams.get("sort") ?? "created_at";

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("agencies")
      .select(
        "id, name, slug, owner_email, plan, subscription_status, trial_ends_at, credits_balance, is_active, created_at, updated_at",
        { count: "exact" }
      );

    if (plan && PLAN_IDS.includes(plan as (typeof PLAN_IDS)[number])) {
      query = query.eq("plan", plan);
    }
    if (status) {
      query = query.eq("subscription_status", status);
    }
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Validate sort column against allowlist
    const allowedSorts = ["created_at", "name", "plan", "credits_balance", "updated_at"];
    const sortColumn = allowedSorts.includes(sort) ? sort : "created_at";

    query = query
      .order(sortColumn, { ascending: sortColumn === "name" })
      .range(offset, offset + limit - 1);

    const { data: agencies, count, error } = await query;

    if (error) throw error;

    // Get user and client counts per agency in parallel
    const agencyIds = (agencies ?? []).map((a) => a.id);

    const [usersResult, clientsResult] = await Promise.all([
      supabase
        .from("users")
        .select("agency_id")
        .in("agency_id", agencyIds),
      supabase
        .from("clients")
        .select("agency_id")
        .in("agency_id", agencyIds),
    ]);

    // Aggregate counts
    const userCounts = new Map<string, number>();
    for (const u of usersResult.data ?? []) {
      userCounts.set(u.agency_id, (userCounts.get(u.agency_id) ?? 0) + 1);
    }

    const clientCounts = new Map<string, number>();
    for (const c of clientsResult.data ?? []) {
      clientCounts.set(c.agency_id, (clientCounts.get(c.agency_id) ?? 0) + 1);
    }

    const enriched = (agencies ?? []).map((a) => ({
      ...a,
      userCount: userCounts.get(a.id) ?? 0,
      clientCount: clientCounts.get(a.id) ?? 0,
    }));

    return NextResponse.json({
      agencies: enriched,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (error) {
    return handleAdminError(error);
  }
}
