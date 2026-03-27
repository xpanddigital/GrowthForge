import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";
import { z } from "zod";
import { uuidLike } from "@/lib/utils/validators";

export const dynamic = "force-dynamic";

const triggerSchema = z.object({
  clientId: uuidLike,
  keywords: z.array(z.string().min(1).max(200)).min(3).max(20),
  competitors: z.array(z.string().max(200)).max(3).optional().default([]),
});

const PILLARS = ["citations", "ai_presence", "entities", "reviews", "press"] as const;

// POST /api/free-audit/trigger
// Creates keywords, creates audit with is_free_audit=true, and queues the audit job.
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

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

    const body = await request.json();
    const validated = triggerSchema.parse(body);

    // Verify client belongs to user's agency
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, agency_id")
      .eq("id", validated.clientId)
      .eq("agency_id", user.agency_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // 1. Create keyword records
    const keywordRows = validated.keywords.map((keyword) => ({
      client_id: validated.clientId,
      keyword,
      source: "free_audit" as const,
      tags: [],
      scan_platforms: ["reddit", "quora", "facebook_groups"],
      is_active: true,
    }));

    await supabase.from("keywords").upsert(keywordRows, {
      onConflict: "client_id,keyword",
      ignoreDuplicates: true,
    });

    // 2. Update client with competitors if provided
    if (validated.competitors.length > 0) {
      await supabase
        .from("audits")
        .update({ competitors_analyzed: validated.competitors })
        .eq("client_id", validated.clientId);
    }

    // 3. Create audit record
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .insert({
        client_id: validated.clientId,
        audit_type: "full",
        status: "pending",
        is_free_audit: true,
        credits_used: 0,
        action_plan: [],
        competitors_analyzed: validated.competitors,
      })
      .select("id")
      .single();

    if (auditError || !audit) {
      throw new Error(
        `Failed to create audit: ${auditError?.message || "Unknown error"}`
      );
    }

    // 4. Create pillar result rows
    const pillarRows = PILLARS.map((pillar) => ({
      audit_id: audit.id,
      pillar,
      score: 0,
      status: "pending" as const,
      findings: {},
      recommendations: [],
    }));

    await supabase.from("audit_pillar_results").insert(pillarRows);

    // 5. Queue the Inngest audit job
    await inngest.send({
      name: "audit/run",
      data: {
        auditId: audit.id,
        clientId: validated.clientId,
        agencyId: user.agency_id,
        auditType: "full",
      },
    });

    return NextResponse.json(
      {
        data: {
          auditId: audit.id,
          clientId: validated.clientId,
          status: "pending",
          message: `Free audit queued for ${client.name}`,
        },
      },
      { status: 202 }
    );
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
