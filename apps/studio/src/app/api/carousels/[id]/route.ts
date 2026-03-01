import { NextResponse } from "next/server";
import { getCarousel, updateCarousel, deleteCarousel } from "@/lib/studio/carousel-store";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/carousels/:id */
export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const carousel = await getCarousel(id);
  if (!carousel) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ carousel });
}

/** PATCH /api/carousels/:id — title / slides 부분 수정 */
export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const updated = await updateCarousel(id, body);
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ carousel: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** DELETE /api/carousels/:id */
export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ok = await deleteCarousel(id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
