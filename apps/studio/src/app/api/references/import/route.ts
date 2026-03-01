import { NextResponse } from "next/server";
import { importFromInstaloader } from "@/lib/studio/reference-db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.source || !body.accountId) {
      return NextResponse.json({ error: "source and accountId required" }, { status: 400 });
    }
    const result = importFromInstaloader(body.source, body.accountId, body.limit);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
