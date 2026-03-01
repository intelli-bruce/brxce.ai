import { NextResponse } from "next/server";
import { getSlideImagePath } from "@/lib/studio/reference-db";
import { readFileSync, existsSync } from "fs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ postId: string; slideIndex: string }> }
) {
  const { postId, slideIndex } = await params;
  const idx = parseInt(slideIndex);
  if (isNaN(idx)) return NextResponse.json({ error: "invalid slideIndex" }, { status: 400 });

  const imagePath = getSlideImagePath(postId, idx);
  if (!imagePath || !existsSync(imagePath)) {
    return NextResponse.json({ error: "image not found" }, { status: 404 });
  }

  const buffer = readFileSync(imagePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
