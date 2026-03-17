import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createSpokespersonSchema } from "@/lib/utils/validators";
import { handleApiError } from "@/lib/utils/errors";

// GET /api/press/spokespersons — List spokespersons for a client
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    let query = supabase.from("spokespersons").select("*").order("name");
    if (clientId) query = query.eq("client_id", clientId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/press/spokespersons — Create a spokesperson
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createSpokespersonSchema.parse(body);

    const { data, error } = await supabase
      .from("spokespersons")
      .insert({
        client_id: validated.client_id,
        name: validated.name,
        title: validated.title,
        email: validated.email ?? null,
        bio: validated.bio ?? null,
        is_primary: validated.is_primary ?? false,
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
