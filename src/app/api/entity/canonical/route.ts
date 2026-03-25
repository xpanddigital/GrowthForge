import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { z } from "zod";
import { uuidLike } from "@/lib/utils/validators";

const createCanonicalSchema = z.object({
  client_id: uuidLike,
  canonical_name: z.string().min(1, "canonical_name is required"),
  canonical_description: z.string().min(1, "canonical_description is required"),
  canonical_category: z.string().min(1, "canonical_category is required"),
  canonical_tagline: z.string().nullish(),
  canonical_subcategories: z.array(z.string()).default([]),
  canonical_contact: z.record(z.string(), z.unknown()).default({}),
  canonical_urls: z.record(z.string(), z.unknown()).default({}),
  canonical_founding_year: z.number().int().nullish(),
  canonical_founder_name: z.string().nullish(),
  canonical_employee_count: z.string().nullish(),
  canonical_service_areas: z.array(z.string()).default([]),
});

// GET /api/entity/canonical?clientId=xxx — Get active canonical for a client
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const history = searchParams.get("history") === "true";

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    // Verify client belongs to user's agency
    const { data: user } = await supabase
      .from("users")
      .select("agency_id")
      .eq("id", authUser.user.id)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .eq("agency_id", user.agency_id)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: "Client not found or does not belong to your agency" },
        { status: 404 }
      );
    }

    // If history=true, return all versions for this client
    if (history) {
      const { data: versions, error } = await supabase
        .from("entity_canonical")
        .select("id, client_id, canonical_name, canonical_description, canonical_category, status, version, approved_by, approved_at, created_at, updated_at")
        .eq("client_id", clientId)
        .order("version", { ascending: false });

      if (error) throw error;
      return NextResponse.json({ data: versions || [] });
    }

    // Return latest approved version, or latest draft if none approved
    const { data: approved } = await supabase
      .from("entity_canonical")
      .select("*")
      .eq("client_id", clientId)
      .eq("status", "approved")
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (approved) {
      return NextResponse.json({ data: approved });
    }

    // No approved version — return latest draft
    const { data: draft } = await supabase
      .from("entity_canonical")
      .select("*")
      .eq("client_id", clientId)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (!draft) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: draft });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/entity/canonical — Create/update canonical (new version)
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
    const validated = createCanonicalSchema.parse(body);

    // Verify client belongs to user's agency
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", validated.client_id)
      .eq("agency_id", user.agency_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Client not found or does not belong to your agency" },
        { status: 404 }
      );
    }

    // Get max version for this client
    const { data: maxVersionRow } = await supabase
      .from("entity_canonical")
      .select("version, id")
      .eq("client_id", validated.client_id)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    const newVersion = maxVersionRow ? maxVersionRow.version + 1 : 1;
    const previousVersionId = maxVersionRow?.id || null;

    const { data: canonical, error: insertError } = await supabase
      .from("entity_canonical")
      .insert({
        client_id: validated.client_id,
        canonical_name: validated.canonical_name,
        canonical_description: validated.canonical_description,
        canonical_category: validated.canonical_category,
        canonical_tagline: validated.canonical_tagline || null,
        canonical_subcategories: validated.canonical_subcategories,
        canonical_contact: validated.canonical_contact,
        canonical_urls: validated.canonical_urls,
        canonical_founding_year: validated.canonical_founding_year || null,
        canonical_founder_name: validated.canonical_founder_name || null,
        canonical_employee_count: validated.canonical_employee_count || null,
        canonical_service_areas: validated.canonical_service_areas,
        status: "draft",
        version: newVersion,
        previous_version_id: previousVersionId,
      })
      .select("*")
      .single();

    if (insertError || !canonical) {
      throw new Error(
        `Failed to create canonical: ${insertError?.message || "Unknown error"}`
      );
    }

    return NextResponse.json({ data: canonical }, { status: 201 });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
