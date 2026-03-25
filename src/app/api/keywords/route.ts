import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createKeywordsSchema, updateKeywordSchema } from "@/lib/utils/validators";
import { handleApiError } from "@/lib/utils/errors";

// GET /api/keywords?client_id=xxx
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

    const { data: keywords, error } = await supabase
      .from("keywords")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: keywords });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/keywords — Bulk create keywords
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's agency for limit check
    const { data: user } = await supabase
      .from("users")
      .select("agency_id")
      .eq("id", authUser.user.id)
      .single();

    const body = await request.json();
    const validated = createKeywordsSchema.parse(body);

    // Check keyword limit per client
    if (user) {
      const { data: agency } = await supabase
        .from("agencies")
        .select("max_keywords_per_client")
        .eq("id", user.agency_id)
        .single();

      if (agency) {
        const { count: currentCount } = await supabase
          .from("keywords")
          .select("id", { count: "exact", head: true })
          .eq("client_id", validated.client_id)
          .eq("is_active", true);

        const newTotal = (currentCount || 0) + validated.keywords.length;
        if (newTotal > agency.max_keywords_per_client) {
          return NextResponse.json(
            {
              error: `Keyword limit reached. You can have up to ${agency.max_keywords_per_client} keywords per client. Currently: ${currentCount}, trying to add: ${validated.keywords.length}.`,
              code: "KEYWORD_LIMIT_REACHED",
            },
            { status: 403 }
          );
        }
      }
    }

    const records = validated.keywords.map((kw) => ({
      client_id: validated.client_id,
      keyword: kw.keyword.trim(),
      tags: kw.tags || [],
      intent: kw.intent || null,
      scan_platforms: kw.scan_platforms || ["reddit", "quora", "facebook_groups"],
      source: "manual" as const,
    }));

    const { data: keywords, error } = await supabase
      .from("keywords")
      .upsert(records, { onConflict: "client_id,keyword" })
      .select();

    if (error) throw error;

    return NextResponse.json({ data: keywords }, { status: 201 });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH /api/keywords?id=xxx — Update a single keyword
export async function PATCH(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const body = await request.json();
    const validated = updateKeywordSchema.parse(body);

    const { data: keyword, error } = await supabase
      .from("keywords")
      .update(validated)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: keyword });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE /api/keywords?id=xxx
export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { error } = await supabase.from("keywords").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Keyword deleted" });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
