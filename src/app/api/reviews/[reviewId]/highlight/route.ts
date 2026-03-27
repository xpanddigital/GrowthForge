import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// POST /api/reviews/:reviewId/highlight — toggle highlight flag
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reviewId } = await params;

  // Get current state
  const { data: review, error: fetchError } = await supabase
    .from("reviews")
    .select("is_highlighted")
    .eq("id", reviewId)
    .single();

  if (fetchError || !review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("reviews")
    .update({ is_highlighted: !review.is_highlighted })
    .eq("id", reviewId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    highlighted: !review.is_highlighted,
  });
}
