import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { updateClientSchema } from "@/lib/utils/validators";
import { handleApiError } from "@/lib/utils/errors";

// GET /api/clients/[clientId]
export async function GET(
  _request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: client, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", params.clientId)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ data: client });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH /api/clients/[clientId]
export async function PATCH(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateClientSchema.parse(body);

    const { data: client, error } = await supabase
      .from("clients")
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.clientId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: client });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE /api/clients/[clientId]
export async function DELETE(
  _request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", params.clientId);

    if (error) throw error;

    return NextResponse.json({ message: "Client deleted" });
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
