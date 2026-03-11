import { NextResponse } from "next/server";
import { importVideoFromUrl } from "@/lib/studio/reference-db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }
    const result = importVideoFromUrl(body.url);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
