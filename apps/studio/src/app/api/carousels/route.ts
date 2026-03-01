import { NextResponse } from "next/server";
import { loadCarousels, createCarousel } from "@/lib/studio/carousel-store";

/** GET /api/carousels — 전체 목록 */
export async function GET() {
  const carousels = await loadCarousels();
  return NextResponse.json({ carousels });
}

/** POST /api/carousels — 새 캐러셀 생성
 * Body: { title: string, slides: [{ templateId, label, category, content, overrides }] }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !Array.isArray(body.slides)) {
      return NextResponse.json({ error: "title and slides[] required" }, { status: 400 });
    }
    const carousel = await createCarousel(body);
    return NextResponse.json({ carousel }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
