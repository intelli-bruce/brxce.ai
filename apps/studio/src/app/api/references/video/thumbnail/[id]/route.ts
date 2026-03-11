import { NextRequest, NextResponse } from "next/server";
import { getVideoThumbnailPath } from "@/lib/studio/reference-db";
import { readFileSync, existsSync } from "fs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const filePath = getVideoThumbnailPath(id);
  if (!filePath || !existsSync(filePath)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const buf = readFileSync(filePath);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
