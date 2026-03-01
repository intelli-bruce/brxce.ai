import { NextResponse } from "next/server";
import { getAccounts, createAccount } from "@/lib/studio/reference-db";

export async function GET() {
  return NextResponse.json({ accounts: getAccounts() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    createAccount(body);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
