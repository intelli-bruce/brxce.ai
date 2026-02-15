import { NextResponse } from "next/server";

export async function POST() {
  const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!SRK || !URL) return NextResponse.json({ error: "no env" }, { status: 500 });

  // Use pg_net or direct postgres — but we need raw SQL.
  // Supabase doesn't expose raw SQL via PostgREST.
  // We'll use the Management API instead.
  return NextResponse.json({ error: "Use Supabase Dashboard SQL editor" }, { status: 501 });
}
