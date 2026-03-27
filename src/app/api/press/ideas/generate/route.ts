import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { triggerIdeationSchema } from "@/lib/utils/validators";
import { handleApiError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";

export const dynamic = "force-dynamic";

// POST /api/press/ideas/generate — Trigger campaign ideation
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
    const validated = triggerIdeationSchema.parse(body);

    // Verify client belongs to agency
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("id", validated.client_id)
      .single();
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    await inngest.send({
      name: "press/ideate",
      data: {
        clientId: validated.client_id,
        agencyId: user.agency_id as string,
        spokespersonId: validated.spokesperson_id,
        month: validated.month,
        year: validated.year,
        count: validated.count,
      },
    });

    return NextResponse.json({ message: "Ideation queued" }, { status: 202 });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
