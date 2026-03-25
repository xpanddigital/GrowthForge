import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";
import { rateLimit } from "@/lib/utils/rate-limit";
import { RateLimitError } from "@/lib/utils/errors";

// POST /api/monitor/run — trigger manual monitoring scan
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's agency for rate limiting
    const { data: userData } = await supabase
      .from("users")
      .select("agency_id")
      .eq("id", user.id)
      .single();

    if (userData) {
      // Rate limit: max 5 monitor runs per hour per agency
      rateLimit(`monitor:${userData.agency_id}`, { maxRequests: 5, windowMs: 3_600_000 });
    }

    const body = await req.json();
    const { clientId, runContentGaps } = body as {
      clientId: string;
      runContentGaps?: boolean;
    };

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    // Verify client belongs to user's agency (RLS enforces agency isolation)
    const { data: client, error } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Queue the monitoring run
    console.log("[monitor/run] Sending Inngest event for client:", clientId);
    const sendResult = await inngest.send({
      name: "monitor/run",
      data: { clientId, runContentGaps: runContentGaps || false },
    });
    console.log("[monitor/run] Inngest send result:", JSON.stringify(sendResult));
    return NextResponse.json({ status: "queued", clientId }, { status: 202 });
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: err.message, retryAfterMs: err.details?.retryAfterMs },
        { status: 429 }
      );
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error("[monitor/run] Failed:", message);
    return NextResponse.json(
      { error: "Failed to queue scan", details: message },
      { status: 500 }
    );
  }
}
