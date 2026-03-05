import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/** GET /api/funnel-slots — list all slots */
export async function GET() {
  const sb = createSupabaseAdmin();
  const { data, error } = await sb
    .from("funnel_slots")
    .select("*")
    .order("phase", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slots: data });
}

/** POST /api/funnel-slots — create a slot */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.funnel_stage) {
      return NextResponse.json({ error: "title and funnel_stage required" }, { status: 400 });
    }

    const sb = createSupabaseAdmin();
    const { data, error } = await sb
      .from("funnel_slots")
      .insert({
        title: body.title,
        description: body.description ?? null,
        funnel_stage: body.funnel_stage,
        channel: body.channel ?? null,
        priority: body.priority ?? "medium",
        phase: body.phase ?? null,
        status: body.status ?? "planned",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ slot: data }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PATCH /api/funnel-slots — update slot status */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const sb = createSupabaseAdmin();
    const updates: Record<string, unknown> = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.phase !== undefined) updates.phase = body.phase;
    if (body.channel !== undefined) updates.channel = body.channel;
    if (body.notes !== undefined) updates.notes = body.notes;

    const { data, error } = await sb
      .from("funnel_slots")
      .update(updates)
      .eq("id", body.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ slot: data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE /api/funnel-slots — delete a slot */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const sb = createSupabaseAdmin();
    const { error } = await sb.from("funnel_slots").delete().eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
