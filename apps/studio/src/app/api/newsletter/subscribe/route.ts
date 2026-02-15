import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "유효한 이메일을 입력하세요." }, { status: 400 });
    }

    const sb = createSupabaseAdmin();

    // Check existing
    const { data: existing } = await sb
      .from("subscribers")
      .select("id, status")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing) {
      if (existing.status === "subscribed") {
        return NextResponse.json({ error: "이미 구독 중입니다." }, { status: 409 });
      }
      // Re-subscribe
      await sb
        .from("subscribers")
        .update({ status: "subscribed", subscribed_at: new Date().toISOString(), unsubscribed_at: null, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      return NextResponse.json({ ok: true });
    }

    const { error } = await sb
      .from("subscribers")
      .insert({ email: email.toLowerCase().trim() });

    if (error) {
      return NextResponse.json({ error: "구독 처리 중 오류가 발생했습니다." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
