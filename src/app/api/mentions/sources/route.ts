import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";

// GET /api/mentions/sources — Get discovered mention sources for a client
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const clientId = url.searchParams.get("clientId");
    const platform = url.searchParams.get("platform");
    const mentionType = url.searchParams.get("mentionType");

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId query parameter required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("mention_sources")
      .select("*")
      .eq("client_id", clientId)
      .order("discovered_at", { ascending: false })
      .limit(200);

    if (platform) {
      query = query.eq("platform", platform);
    }

    if (mentionType) {
      query = query.eq("mention_type", mentionType);
    }

    const { data: sources, error } = await query;

    if (error) throw error;

    // Aggregate stats
    const stats = {
      total: (sources || []).length,
      brand: (sources || []).filter(
        (s) => s.mention_type === "brand" || s.mention_type === "both"
      ).length,
      competitor: (sources || []).filter(
        (s) => s.mention_type === "competitor" || s.mention_type === "both"
      ).length,
      platforms: Array.from(
        new Set((sources || []).map((s) => s.platform))
      ),
    };

    return NextResponse.json({ data: sources || [], stats });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
