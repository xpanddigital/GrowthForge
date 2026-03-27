import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";
import { z } from "zod";
import { uuidLike } from "@/lib/utils/validators";

export const dynamic = "force-dynamic";

const triggerScanSchema = z.object({
  clientId: uuidLike,
  scanType: z
    .enum(["full", "quick", "single", "schema_only"])
    .default("full"),
  platform: z.string().optional(),
});

// POST /api/entity/scan — Trigger entity scan
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

    // Validate single scan type requires platform
    if (validated.scanType === "single" && !validated.platform) {
      return NextResponse.json(
        { error: "platform is required when scanType is 'single'" },
        { status: 400 }
      );
    }

    // Verify client belongs to user's agency
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, agency_id")
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

    // Create scan record
    const { data: scan, error: scanError } = await supabase
      .from("entity_scans")
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
      name: "entity/scan",
      data: {
        clientId: validated.clientId,
        scanId: scan.id,
        scanType: validated.scanType,
        singlePlatform: validated.platform,
      },
    });

    return NextResponse.json(
      {
        data: {
          scanId: scan.id,
          clientId: validated.clientId,
          scanType: validated.scanType,
          status: "pending",
          message: `Entity scan queued for ${client.name}`,
        },
      },
      { status: 202 }
    );
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
