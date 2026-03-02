import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const sb = createClient(url, key);

  const { action } = await req.json().catch(() => ({ action: "" }));

  if (action === "create_email_templates") {
    // Since we can't run DDL via PostgREST, we'll check if table exists by trying to query it
    const { error } = await sb.from("email_templates").select("id").limit(1);
    if (error && error.code === "42P01") {
      return NextResponse.json({ 
        error: "Table does not exist. Please run this SQL in Supabase Dashboard:",
        sql: `CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  header_name TEXT NOT NULL DEFAULT 'Bruce Choe',
  header_handle TEXT NOT NULL DEFAULT '@brxce.ai',
  greeting TEXT NOT NULL DEFAULT '안녕하세요,',
  body TEXT NOT NULL,
  cta_text TEXT DEFAULT '',
  cta_url TEXT DEFAULT '',
  signoff_name TEXT NOT NULL DEFAULT 'Bruce Choe',
  signoff_desc TEXT NOT NULL DEFAULT '에이전틱 워크플로우로 회사를 운영하는 사람',
  signoff_url TEXT NOT NULL DEFAULT 'https://brxce.ai',
  footer_text TEXT NOT NULL DEFAULT 'brxce.ai — 에이전틱 워크플로우',
  match_product TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`
      }, { status: 400 });
    }
    if (!error) {
      return NextResponse.json({ ok: true, message: "Table already exists" });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
