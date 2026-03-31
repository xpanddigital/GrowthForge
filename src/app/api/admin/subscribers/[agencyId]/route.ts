import { NextResponse } from "next/server";
import { requirePlatformAdmin, handleAdminError } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agencyId: string }> }
) {
  try {
    const { supabase } = await requirePlatformAdmin();
    const { agencyId } = await params;

    // First, get client IDs for this agency (needed for usage counts)
    const { data: clientRows } = await supabase
      .from("clients")
      .select("id")
      .eq("agency_id", agencyId);

    const clientIds = (clientRows ?? []).map((c) => c.id);

    // Now run all queries in parallel
    const [
      agencyResult,
      usersResult,
      clientsResult,
      creditsResult,
      eventsResult,
      notesResult,
      auditsResult,
      threadsResult,
      responsesResult,
    ] = await Promise.all([
      // Agency detail
      supabase
        .from("agencies")
        .select("*")
        .eq("id", agencyId)
        .single(),

      // Users
      supabase
        .from("users")
        .select("id, email, full_name, role, last_active_at, created_at")
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false }),

      // Clients with keyword count
      supabase
        .from("clients")
        .select("id, name, slug, is_active, created_at, keywords(count)")
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false }),

      // Last 30 credit transactions
      supabase
        .from("credit_transactions")
        .select("id, amount, reason, balance_after, description, created_at")
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false })
        .limit(30),

      // Subscription events
      supabase
        .from("subscription_events")
        .select("id, event_type, previous_plan, new_plan, previous_status, new_status, mrr_delta, amount_cents, occurred_at")
        .eq("agency_id", agencyId)
        .order("occurred_at", { ascending: false }),

      // Admin notes
      supabase
        .from("admin_notes")
        .select("id, note, note_type, author_user_id, created_at")
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false }),

      // Audit count through agency's clients
      clientIds.length > 0
        ? supabase
            .from("audits")
            .select("id", { count: "exact", head: true })
            .in("client_id", clientIds)
        : Promise.resolve({ count: 0, data: null, error: null }),

      // Thread count
      clientIds.length > 0
        ? supabase
            .from("threads")
            .select("id", { count: "exact", head: true })
            .in("client_id", clientIds)
        : Promise.resolve({ count: 0, data: null, error: null }),

      // Response count
      clientIds.length > 0
        ? supabase
            .from("responses")
            .select("id", { count: "exact", head: true })
            .in("client_id", clientIds)
        : Promise.resolve({ count: 0, data: null, error: null }),
    ]);

    if (agencyResult.error) throw agencyResult.error;

    return NextResponse.json({
      agency: agencyResult.data,
      users: usersResult.data ?? [],
      clients: clientsResult.data ?? [],
      creditTransactions: creditsResult.data ?? [],
      subscriptionEvents: eventsResult.data ?? [],
      adminNotes: notesResult.data ?? [],
      usage: {
        audits: auditsResult.count ?? 0,
        threads: threadsResult.count ?? 0,
        responses: responsesResult.count ?? 0,
      },
    });
  } catch (error) {
    return handleAdminError(error);
  }
}
