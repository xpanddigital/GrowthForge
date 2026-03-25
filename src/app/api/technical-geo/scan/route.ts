import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";
import { z } from "zod";
import { uuidLike } from "@/lib/utils/validators";

const triggerScanSchema = z.object({
  clientId: uuidLike,
  scanType: z
    .enum([
      "full",
      "robots_only",
      "freshness_only",
      "citability_only",
      "schema_ssr_only",
    ])
    .default("full"),
});

// POST /api/technical-geo/scan — Trigger technical GEO scan
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("agency_id, role")
      .eq("id", authUser.user.id)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "viewer") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = triggerScanSchema.parse(body);

    // Verify client belongs to user's agency
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, agency_id, website_url")
      .eq("id", validated.clientId)
      .eq("agency_id", user.agency_id)
      .eq("is_active", true)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Client not found or does not belong to your agency" },
        { status: 404 }
      );
    }

    if (!client.website_url) {
      return NextResponse.json(
        { error: "Client has no website URL configured" },
        { status: 400 }
      );
    }

    // Create scan record
    const { data: scan, error: scanError } = await supabase
      .from("technical_geo_scans")
      .insert({
        client_id: validated.clientId,
        scan_type: validated.scanType,
        status: "pending",
      })
      .select("id")
      .single();

    if (scanError || !scan) {
      throw new Error(
        `Failed to create scan: ${scanError?.message || "Unknown error"}`
      );
    }

    // Send Inngest event
    await inngest.send({
      name: "technical-geo/scan",
      data: {
        scanId: scan.id,
        clientId: validated.clientId,
        agencyId: user.agency_id,
        scanType: validated.scanType,
      },
    });

    return NextResponse.json(
      {
        data: {
          scanId: scan.id,
          clientId: validated.clientId,
          scanType: validated.scanType,
          status: "pending",
          message: `Technical GEO scan queued for ${client.name}`,
        },
      },
      { status: 202 }
    );
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// GET /api/technical-geo/scan — List scans for a client
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const clientId = url.searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId query parameter required" },
        { status: 400 }
      );
    }

    const { data: scans, error } = await supabase
      .from("technical_geo_scans")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: scans });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
