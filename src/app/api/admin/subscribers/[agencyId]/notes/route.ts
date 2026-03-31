import { NextResponse } from "next/server";
import { requirePlatformAdmin, handleAdminError } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const VALID_NOTE_TYPES = ["general", "flag", "credit_adjustment", "plan_change"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agencyId: string }> }
) {
  try {
    const { supabase } = await requirePlatformAdmin();
    const { agencyId } = await params;

    const { data: notes, error } = await supabase
      .from("admin_notes")
      .select("id, note, note_type, author_user_id, created_at")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ notes: notes ?? [] });
  } catch (error) {
    return handleAdminError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agencyId: string }> }
) {
  try {
    const { supabase, userId } = await requirePlatformAdmin();
    const { agencyId } = await params;

    const body = await request.json();
    const { note, note_type } = body as { note: string; note_type?: string };

    if (!note || typeof note !== "string" || note.trim().length === 0) {
      return NextResponse.json(
        { error: "note is required" },
        { status: 400 }
      );
    }

    const resolvedType = note_type && VALID_NOTE_TYPES.includes(note_type)
      ? note_type
      : "general";

    const { data: created, error } = await supabase
      .from("admin_notes")
      .insert({
        agency_id: agencyId,
        author_user_id: userId,
        note: note.trim(),
        note_type: resolvedType,
      })
      .select("id, note, note_type, author_user_id, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ note: created }, { status: 201 });
  } catch (error) {
    return handleAdminError(error);
  }
}
