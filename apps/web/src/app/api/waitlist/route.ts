import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getWaitlistTemplate, waitlistEmailHtml } from "@/lib/waitlist-email-templates";

export async function POST(req: NextRequest) {
  try {
    const { email, product } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "유효한 이메일을 입력하세요." }, { status: 400 });
    }

    const sb = createSupabaseAdmin();

    // 1. DB에 저장
    const { error: dbError } = await sb.from("submissions").insert({
      email: email.toLowerCase().trim(),
      type: "waitlist",
      product: product || null,
    });

    if (dbError) {
      console.error("submission insert error:", dbError);
    }

    // 2. 웰컴 이메일 자동 발송
    const template = getWaitlistTemplate(product || "default");
    const html = waitlistEmailHtml(template);

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && resendKey !== "your-resend-api-key-here") {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Bruce Choe <bruce@send.brxce.ai>",
          to: [email.toLowerCase().trim()],
          subject: template.subject,
          html,
          reply_to: "bruce@intellieffect.com",
        }),
      });

      if (!res.ok) {
        console.error("Resend error:", await res.text());
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("waitlist error:", e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
