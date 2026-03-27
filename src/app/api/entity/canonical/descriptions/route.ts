import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { generatePlatformDescriptions } from "@/lib/entity/platform-descriptions";
import { getPlatformsForVertical } from "@/lib/entity/platform-config";
import type { Vertical } from "@/lib/entity/platform-config";
import { z } from "zod";
import { uuidLike } from "@/lib/utils/validators";

export const dynamic = "force-dynamic";

const descriptionsSchema = z.object({
  clientId: uuidLike,
});

// POST /api/entity/canonical/descriptions — Regenerate platform-adapted descriptions
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
    const validated = descriptionsSchema.parse(body);

    // Verify client belongs to user's agency and get vertical
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, vertical")
      .eq("id", validated.clientId)
      .eq("agency_id", user.agency_id)
      .single();

    if (clientError || !client) {
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
        { error: "No approved canonical found. Approve a canonical before generating descriptions." },
        { status: 400 }
      );
    }

    // Get platforms for the client's vertical
    const vertical = (client.vertical as Vertical) || null;
    const platforms = getPlatformsForVertical(vertical).map((p) => p.platform);

    // Generate platform-adapted descriptions
    const descriptions = await generatePlatformDescriptions(
      {
        canonicalName: canonical.canonical_name,
        canonicalDescription: canonical.canonical_description,
        canonicalTagline: canonical.canonical_tagline,
        canonicalCategory: canonical.canonical_category,
        canonicalServiceAreas: canonical.canonical_service_areas || [],
      },
      platforms
    );

    // Update the canonical's platform_descriptions field
    const { data: updated, error: updateError } = await supabase
      .from("entity_canonical")
      .update({
        platform_descriptions: descriptions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", canonical.id)
      .select("*")
      .single();

    if (updateError || !updated) {
      throw new Error(
        `Failed to update platform descriptions: ${updateError?.message || "Unknown error"}`
      );
    }

    return NextResponse.json({ data: descriptions });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
