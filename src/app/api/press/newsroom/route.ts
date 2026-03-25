import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { generateNewsroomPage } from "@/lib/press/newsroom-generator";
import { z } from "zod";
import { uuidLike } from "@/lib/utils/validators";

const generateSchema = z.object({
  clientId: uuidLike,
});

// POST /api/press/newsroom — Generate newsroom page HTML
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

    if (!user || user.role === "viewer") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = generateSchema.parse(body);

    // Load client
    const { data: client } = await supabase
      .from("clients")
      .select("id, name, website_url, brand_brief, logo_url, industry, location, agency_id")
      .eq("id", validated.clientId)
      .eq("agency_id", user.agency_id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Load approved press releases
    const { data: releases } = await supabase
      .from("press_releases")
      .select("id, title, subtitle, body_html, body_text, pr_type, target_region, created_at, public_slug, public_url")
      .eq("client_id", validated.clientId)
      .eq("is_current", true)
      .order("created_at", { ascending: false })
      .limit(20);

    // Load press coverage
    const { data: coverage } = await supabase
      .from("press_coverage")
      .select("title, url, publication, publish_date, coverage_type")
      .eq("client_id", validated.clientId)
      .order("publish_date", { ascending: false })
      .limit(20);

    // Load primary spokesperson
    const { data: spokesperson } = await supabase
      .from("spokespersons")
      .select("name, title, email, phone, bio, photo_url")
      .eq("client_id", validated.clientId)
      .eq("is_primary", true)
      .single();

    const result = generateNewsroomPage(
      {
        name: client.name,
        website_url: client.website_url,
        brand_brief: client.brand_brief,
        logo_url: client.logo_url,
        industry: client.industry,
        location: client.location,
      },
      releases || [],
      (coverage || []).map((c) => ({
        title: c.title,
        url: c.url,
        publication: c.publication,
        publish_date: c.publish_date,
        coverage_type: c.coverage_type,
      })),
      spokesperson || null
    );

    return NextResponse.json({ data: result });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
