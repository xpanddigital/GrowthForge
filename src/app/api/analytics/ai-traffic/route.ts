import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { getAIReferralTraffic } from "@/lib/analytics/ga4-attribution";

export const dynamic = "force-dynamic";

// GET /api/analytics/ai-traffic — Get AI referral traffic data
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const propertyId = url.searchParams.get("propertyId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    if (!propertyId) {
      return NextResponse.json(
        { error: "propertyId query parameter required" },
        { status: 400 }
      );
    }

    // Default to last 30 days if no date range provided
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dateRange = {
      start: startDate || thirtyDaysAgo.toISOString().split("T")[0],
      end: endDate || now.toISOString().split("T")[0],
    };

    const data = await getAIReferralTraffic(propertyId, dateRange);

    return NextResponse.json({ data });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
