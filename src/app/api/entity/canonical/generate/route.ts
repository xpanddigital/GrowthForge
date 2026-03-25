import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { generateAutoCanonical } from "@/lib/entity/auto-canonical";
import { z } from "zod";
import { uuidLike } from "@/lib/utils/validators";

const generateCanonicalSchema = z.object({
  clientId: uuidLike,
});

// POST /api/entity/canonical/generate — Auto-generate canonical from brand brief
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
    const validated = generateCanonicalSchema.parse(body);

    // Load client and verify agency ownership
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select(
        "id, name, brand_brief, website_url, target_audience, key_differentiators"
      )
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

    if (!client.brand_brief) {
      return NextResponse.json(
        { error: "Client must have a brand brief before generating a canonical" },
        { status: 400 }
      );
    }

    // Generate canonical via AI
    const generated = await generateAutoCanonical({
      clientName: client.name,
      brandBrief: client.brand_brief,
      websiteUrl: client.website_url,
      targetAudience: client.target_audience,
      keyDifferentiators: client.key_differentiators,
    });

    // Get max version for this client
    const { data: maxVersionRow } = await supabase
      .from("entity_canonical")
      .select("version, id")
      .eq("client_id", validated.clientId)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    const newVersion = maxVersionRow ? maxVersionRow.version + 1 : 1;
    const previousVersionId = maxVersionRow?.id || null;

    // Insert as a new draft version
    const { data: canonical, error: insertError } = await supabase
      .from("entity_canonical")
      .insert({
        client_id: validated.clientId,
        canonical_name: generated.canonicalName,
        canonical_description: generated.canonicalDescription,
        canonical_category: generated.canonicalCategory,
        canonical_tagline: generated.canonicalTagline,
        canonical_subcategories: generated.canonicalSubcategories,
        canonical_founding_year: generated.canonicalFoundingYear,
        canonical_founder_name: generated.canonicalFounderName,
        canonical_employee_count: generated.canonicalEmployeeCount,
        canonical_service_areas: generated.canonicalServiceAreas,
        status: "draft",
        version: newVersion,
        previous_version_id: previousVersionId,
      })
      .select("*")
      .single();

    if (insertError || !canonical) {
      throw new Error(
        `Failed to insert generated canonical: ${insertError?.message || "Unknown error"}`
      );
    }

    return NextResponse.json({ data: canonical }, { status: 201 });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
