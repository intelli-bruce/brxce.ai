import { NextRequest, NextResponse } from "next/server";
import { getVideoPosts } from "@/lib/studio/reference-db";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const filters = {
    account: sp.get("account") ?? undefined,
    platform: sp.get("platform") ?? undefined,
    style: sp.get("style") ?? undefined,
    sort: (sp.get("sort") as any) ?? "latest",
    limit: sp.has("limit") ? Number(sp.get("limit")) : 50,
    offset: sp.has("offset") ? Number(sp.get("offset")) : 0,
  };
  return NextResponse.json(getVideoPosts(filters));
}
