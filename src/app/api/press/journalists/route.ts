import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createJournalistSchema } from "@/lib/utils/validators";
import { handleApiError } from "@/lib/utils/errors";

// GET /api/press/journalists — List + search journalists
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const beat = searchParams.get("beat");
    const region = searchParams.get("region");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = (page - 1) * limit;

    let query = supabase
      .from("journalists")
      .select("*", { count: "exact" })
      .order("name")
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,publication.ilike.%${search}%`);
    }
    if (beat) {
      query = query.contains("beats", [beat]);
    }
    if (region) {
      query = query.eq("region", region);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data ?? [], total: count ?? 0, page, limit });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/press/journalists — Create journalist (manual or CSV import)
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("agency_id")
      .eq("id", authUser.user.id)
      .single();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json();

    // Support batch import
    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        const validated = createJournalistSchema.parse(item);
        const { data, error } = await supabase
          .from("journalists")
          .insert({
            agency_id: user.agency_id as string,
            ...validated,
            source: "manual_import",
          })
          .select()
          .single();

        if (!error && data) results.push(data);
      }
      return NextResponse.json({ data: results, imported: results.length }, { status: 201 });
    }

    // Single journalist
    const validated = createJournalistSchema.parse(body);
    const { data, error } = await supabase
      .from("journalists")
      .insert({
        agency_id: user.agency_id as string,
        ...validated,
        source: "manual",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
