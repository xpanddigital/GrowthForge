import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

// GET /api/technical-geo/results — Get scan results and freshness data
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const scanId = url.searchParams.get("scanId");
    const clientId = url.searchParams.get("clientId");

    if (!scanId && !clientId) {
      return NextResponse.json(
        { error: "scanId or clientId query parameter required" },
        { status: 400 }
      );
    }

    if (scanId) {
      // Get specific scan with its freshness data
      const { data: scan, error: scanError } = await supabase
        .from("technical_geo_scans")
        .select("*")
        .eq("id", scanId)
        .single();

      if (scanError || !scan) {
        return NextResponse.json(
          { error: "Scan not found" },
          { status: 404 }
        );
      }

      // Get freshness data for this scan
      const { data: freshness } = await supabase
        .from("content_freshness")
        .select("*")
        .eq("scan_id", scanId)
        .order("refresh_priority", { ascending: true });

      return NextResponse.json({
        data: {
          scan,
          freshness: freshness || [],
        },
      });
    }

    // Get latest scan for client
    const { data: latestScan } = await supabase
      .from("technical_geo_scans")
      .select("*")
      .eq("client_id", clientId!)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!latestScan) {
      return NextResponse.json({ data: { scan: null, freshness: [] } });
    }

    const { data: freshness } = await supabase
      .from("content_freshness")
      .select("*")
      .eq("scan_id", latestScan.id)
      .order("refresh_priority", { ascending: true });

    return NextResponse.json({
      data: {
        scan: latestScan,
        freshness: freshness || [],
      },
    });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
