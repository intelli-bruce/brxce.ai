import { NextResponse } from "next/server";
import { getVideoAccounts } from "@/lib/studio/reference-db";

export async function GET() {
  return NextResponse.json({ accounts: getVideoAccounts() });
}
