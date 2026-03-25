import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { generateLlmsTxt } from "@/lib/entity/llmstxt-generator";
import { z } from "zod";
import { uuidLike } from "@/lib/utils/validators";

const generateLlmsTxtBody = z.object({
  clientId: uuidLike,
});

// POST /api/entity/llmstxt/generate — Generate llms.txt content
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
      .select("agency_id")
      .eq("id", authUser.user.id)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse and validate body
    const body = await request.json();
    const validated = generateLlmsTxtBody.parse(body);

    // Verify client belongs to user's agency and load brand_brief
    const { data: client } = await supabase
      .from("clients")
      .select("id, brand_brief")
      .eq("id", validated.clientId)
      .eq("agency_id", user.agency_id)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: "Client not found or does not belong to your agency" },
        { status: 404 }
      );
    }

    // Load the approved canonical
    const { data: canonical, error: canonicalError } = await supabase
      .from("entity_canonical")
      .select("*")
      .eq("client_id", validated.clientId)
      .eq("status", "approved")
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (canonicalError || !canonical) {
      return NextResponse.json(
        { error: "No approved canonical found for this client. Run an entity scan and approve a canonical first." },
        { status: 404 }
      );
    }

    // Load client keywords
    const { data: keywords } = await supabase
      .from("keywords")
      .select("keyword")
      .eq("client_id", validated.clientId)
      .eq("is_active", true);

    const keywordStrings = (keywords || []).map(
      (k: { keyword: string }) => k.keyword
    );

    // Build canonical input
    const canonicalInput = {
      canonicalName: canonical.canonical_name,
      canonicalDescription: canonical.canonical_description,
      canonicalTagline: canonical.canonical_tagline,
      canonicalCategory: canonical.canonical_category,
      canonicalSubcategories: canonical.canonical_subcategories || [],
      canonicalServiceAreas: canonical.canonical_service_areas || [],
      canonicalFoundingYear: canonical.canonical_founding_year,
      canonicalFounderName: canonical.canonical_founder_name,
      canonicalUrls: canonical.canonical_urls || {},
    };

    const content = await generateLlmsTxt(
      canonicalInput,
      client.brand_brief,
      keywordStrings
    );

    return NextResponse.json({ data: { content } });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
