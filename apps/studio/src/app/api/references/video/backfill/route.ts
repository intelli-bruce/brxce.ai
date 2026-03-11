import { NextResponse } from "next/server";
import { backfillVideoFiles } from "@/lib/studio/reference-db";

export async function POST() {
  try {
    const result = backfillVideoFiles();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
