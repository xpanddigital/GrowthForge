import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";
import { z } from "zod";

const triggerAuditSchema = z.object({
  client_id: z.string().uuid(),
  audit_type: z
    .enum(["full", "citation_only", "ai_presence_only", "quick"])
    .default("full"),
});

const PILLARS = ["citations", "ai_presence", "entities", "reviews", "press"] as const;

// POST /api/audits — Trigger a new AI Visibility Audit
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    // Authenticate
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's agency
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

    // Parse and validate
    const body = await request.json();
    const validated = triggerAuditSchema.parse(body);

    // Verify client belongs to user's agency
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, agency_id")
      .eq("id", validated.client_id)
      .eq("agency_id", user.agency_id)
      .eq("is_active", true)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Client not found or does not belong to your agency" },
        { status: 404 }
      );
    }

    // Create the main audit record
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .insert({
        client_id: validated.client_id,
        audit_type: validated.audit_type,
        status: "pending",
        credits_used: 0,
        action_plan: [],
        competitors_analyzed: [],
      })
      .select("id")
      .single();

    if (auditError || !audit) {
      throw new Error(
        `Failed to create audit: ${auditError?.message || "Unknown error"}`
      );
    }

    // Create 5 pillar result rows
    const pillarRows = PILLARS.map((pillar) => ({
      audit_id: audit.id,
      pillar,
      score: 0,
      status: "pending" as const,
      findings: {},
      recommendations: [],
    }));

    await supabase.from("audit_pillar_results").insert(pillarRows);

    // Queue the Inngest job
    await inngest.send({
      name: "audit/run",
      data: {
        auditId: audit.id,
        clientId: validated.client_id,
        agencyId: user.agency_id,
        auditType: validated.audit_type,
      },
    });

    return NextResponse.json(
      {
        data: {
          auditId: audit.id,
          clientId: validated.client_id,
          status: "pending",
          message: `AI Visibility Audit queued for ${client.name}`,
        },
      },
      { status: 202 }
    );
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// GET /api/audits?client_id=xxx — List audits for a client
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("client_id");

    if (!clientId) {
      return NextResponse.json(
        { error: "client_id is required" },
        { status: 400 }
      );
    }

    const { data: audits, error } = await supabase
      .from("audits")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: audits });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
