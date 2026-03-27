import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createClientSchema } from "@/lib/utils/validators";
import { handleApiError } from "@/lib/utils/errors";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET /api/clients — List all clients for the current agency
export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: clients, error } = await supabase
      .from("clients")
      .select("*, keywords(count)")
      .order("name");

    if (error) throw error;

    // Transform to include keyword_count
    const transformed = (clients || []).map((c) => ({
      ...c,
      keyword_count: (c.keywords as unknown as { count: number }[])?.[0]?.count ?? 0,
      keywords: undefined,
    }));

    return NextResponse.json({ data: transformed });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/clients — Create a new client
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

    // Check client limit
    const { data: agency } = await supabase
      .from("agencies")
      .select("max_clients")
      .eq("id", user.agency_id)
      .single();

    if (agency) {
      const { count: clientCount } = await supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("agency_id", user.agency_id)
        .eq("is_active", true);

      if (clientCount !== null && clientCount >= agency.max_clients) {
        return NextResponse.json(
          {
            error: `Client limit reached (${agency.max_clients}). Upgrade your plan to add more clients.`,
            code: "CLIENT_LIMIT_REACHED",
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validated = createClientSchema.parse(body);

    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        agency_id: user.agency_id,
        name: validated.name,
        slug: slugify(validated.name),
        website_url: validated.website_url || null,
        brand_brief: validated.brand_brief,
        tone_guidelines: validated.tone_guidelines || null,
        target_audience: validated.target_audience || null,
        key_differentiators: validated.key_differentiators || null,
        urls_to_mention: validated.urls_to_mention || [],
        response_rules: validated.response_rules || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: client }, { status: 201 });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
