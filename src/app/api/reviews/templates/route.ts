import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/reviews/templates — review response templates
export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sentimentTarget = searchParams.get("sentimentTarget");
  const vertical = searchParams.get("vertical");

  let query = supabase
    .from("review_response_templates")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (sentimentTarget) query = query.eq("sentiment_target", sentimentTarget);
  if (vertical) query = query.eq("vertical", vertical);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ templates: data });
}

// POST /api/reviews/templates — create response template
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, sentimentTarget, templateText, vertical } = body as {
    name: string;
    sentimentTarget: "positive" | "neutral" | "negative";
    templateText: string;
    vertical?: string;
  };

  if (!name || !sentimentTarget || !templateText) {
    return NextResponse.json(
      { error: "name, sentimentTarget, and templateText are required" },
      { status: 400 }
    );
  }

  // Get user's agency
  const { data: userData } = await supabase
    .from("users")
    .select("agency_id")
    .eq("id", user.id)
    .single();

  if (!userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("review_response_templates")
    .insert({
      agency_id: userData.agency_id,
      name,
      sentiment_target: sentimentTarget,
      template_text: templateText,
      vertical: vertical || "general",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template: data }, { status: 201 });
}
