import { NextRequest, NextResponse } from "next/server";
import { getVideoPost, updateVideoPost } from "@/lib/studio/reference-db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = getVideoPost(id);
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const updated = updateVideoPost(id, body);
  return NextResponse.json(updated);
}
