import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";

// POST /api/reviews/:reviewId/generate-response — generate AI response draft
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

  const { data: review } = await supabase
    .from("reviews")
    .select("client_id")
    .eq("id", reviewId)
    .single();

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  await inngest.send({
    name: "review/generate-response",
    data: {
      reviewId,
      clientId: review.client_id as string,
    },
  });

  return NextResponse.json(
    { status: "queued", reviewId },
    { status: 202 }
  );
}
