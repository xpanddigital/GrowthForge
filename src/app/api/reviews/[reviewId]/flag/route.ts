import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// POST /api/reviews/:reviewId/flag — flag a review for attention
export async function POST(
  req: NextRequest,
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
  const body = await req.json();
  const { reason } = body as { reason?: string };

  const { data: review } = await supabase
    .from("reviews")
    .select("is_flagged")
    .eq("id", reviewId)
    .single();

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const newFlagged = !review.is_flagged;

  const { error } = await supabase
    .from("reviews")
    .update({
      is_flagged: newFlagged,
      flag_reason: newFlagged ? reason || null : null,
    })
    .eq("id", reviewId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ flagged: newFlagged });
}
