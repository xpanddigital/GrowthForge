import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateWebSiteSchema,
  generateFAQSchema,
  generateServiceSchema,
  generateBreadcrumbSchema,
} from "@/lib/entity/schema-generator";
import { z } from "zod";

const generateSchemaBody = z.object({
  clientId: z.string().uuid(),
  schemaType: z.enum([
    "Organization",
    "LocalBusiness",
    "WebSite",
    "FAQ",
    "Service",
    "BreadcrumbList",
  ]),
});

// POST /api/entity/schema/generate — Generate JSON-LD code
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
    const validated = generateSchemaBody.parse(body);

    // Verify client belongs to user's agency
    const { data: client } = await supabase
      .from("clients")
      .select("id")
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

    // Load claimed profile URLs for sameAs
    const { data: profiles } = await supabase
      .from("entity_profiles")
      .select("platform_profile_url")
      .eq("client_id", validated.clientId)
      .eq("is_claimed", true);

    const sameAsUrls = (profiles || [])
      .map((p: { platform_profile_url: string }) => p.platform_profile_url)
      .filter(Boolean);

    // Build canonical input from DB record
    const canonicalInput = {
      canonicalName: canonical.canonical_name,
      canonicalDescription: canonical.canonical_description,
      canonicalTagline: canonical.canonical_tagline,
      canonicalCategory: canonical.canonical_category,
      canonicalSubcategories: canonical.canonical_subcategories || [],
      canonicalContact: canonical.canonical_contact || {},
      canonicalUrls: canonical.canonical_urls || {},
      canonicalFoundingYear: canonical.canonical_founding_year,
      canonicalFounderName: canonical.canonical_founder_name,
      canonicalEmployeeCount: canonical.canonical_employee_count,
      canonicalServiceAreas: canonical.canonical_service_areas || [],
    };

    let code: string;

    switch (validated.schemaType) {
      case "Organization":
        code = generateOrganizationSchema(canonicalInput, sameAsUrls);
        break;
      case "LocalBusiness":
        code = generateLocalBusinessSchema(canonicalInput, undefined, undefined, sameAsUrls);
        break;
      case "WebSite":
        code = generateWebSiteSchema(canonicalInput);
        break;
      case "FAQ":
        // FAQ requires questions — return a template with placeholder items
        code = generateFAQSchema([
          { question: "What does {brand} do?", answer: canonicalInput.canonicalDescription },
        ]);
        break;
      case "Service":
        code = generateServiceSchema(canonicalInput, {
          name: canonicalInput.canonicalCategory,
          description: canonicalInput.canonicalDescription,
          url: (canonicalInput.canonicalUrls?.website as string) || undefined,
        });
        break;
      case "BreadcrumbList": {
        const websiteUrl = (canonicalInput.canonicalUrls?.website as string) || "https://example.com";
        code = generateBreadcrumbSchema([
          { name: "Home", url: websiteUrl },
          { name: canonicalInput.canonicalCategory, url: `${websiteUrl}/services` },
        ]);
        break;
      }
      default:
        return NextResponse.json(
          { error: "Unsupported schema type" },
          { status: 400 }
        );
    }

    return NextResponse.json({ data: { code } });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
