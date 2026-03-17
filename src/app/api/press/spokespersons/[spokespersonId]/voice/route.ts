import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { inngest } from "@/lib/inngest/client";

interface RouteParams {
  params: Promise<{ spokespersonId: string }>;
}

// POST /api/press/spokespersons/[spokespersonId]/voice — Trigger voice modeling
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { spokespersonId } = await params;
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

    const { data: spokesperson } = await supabase
      .from("spokespersons")
      .select("client_id")
      .eq("id", spokespersonId)
      .single();
    if (!spokesperson) {
      return NextResponse.json({ error: "Spokesperson not found" }, { status: 404 });
    }

    const body = await request.json();
    const { voiceSamples } = body as { voiceSamples: string[] };

    if (!voiceSamples?.length) {
      return NextResponse.json({ error: "voiceSamples required" }, { status: 400 });
    }

    await inngest.send({
      name: "press/model-voice",
      data: {
        spokespersonId,
        clientId: spokesperson.client_id as string,
        agencyId: user.agency_id as string,
        voiceSamples,
      },
    });

    return NextResponse.json({ message: "Voice modeling queued" }, { status: 202 });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
