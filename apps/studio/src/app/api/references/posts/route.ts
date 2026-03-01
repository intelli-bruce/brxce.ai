import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/studio/reference-db";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const filters = {
    account: sp.get("account") ?? undefined,
    layout: sp.get("layout") ?? undefined,
    hook: sp.get("hook") ?? undefined,
    cta: sp.get("cta") ?? undefined,
    sort: (sp.get("sort") as any) ?? "latest",
    limit: sp.has("limit") ? Number(sp.get("limit")) : 50,
    offset: sp.has("offset") ? Number(sp.get("offset")) : 0,
  };
  const result = getPosts(filters);
  return NextResponse.json(result);
}
