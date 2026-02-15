import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServer } from "@/lib/supabase-server";
import { newsletterHtml } from "@/lib/newsletter-template";

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const sbAuth = await createSupabaseServer();
    const { data: { user } } = await sbAuth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sbAdmin = createSupabaseAdmin();
    const { data: profile } = await sbAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { subject, bodyHtml } = await req.json();
    if (!subject || !bodyHtml) {
      return NextResponse.json({ error: "제목과 본문을 입력하세요." }, { status: 400 });
    }

    // Get active subscribers
    const { data: subscribers } = await sbAdmin
      .from("subscribers")
      .select("email")
      .eq("status", "subscribed");

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: "구독자가 없습니다." }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://brxce.ai";
    let sentCount = 0;
    const errors: string[] = [];

    // Send emails via Resend
    for (const sub of subscribers) {
      const token = Buffer.from(sub.email).toString("base64url");
      const unsubUrl = `${baseUrl}/newsletter/unsubscribe?token=${token}`;
      const html = newsletterHtml(subject, bodyHtml, unsubUrl);

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Bruce Choe <bruce@send.brxce.ai>",
          to: [sub.email],
          subject,
          html,
        }),
      });

      if (res.ok) {
        sentCount++;
      } else {
        const err = await res.text();
        errors.push(`${sub.email}: ${err}`);
      }
    }

    // Log
    await sbAdmin.from("email_logs").insert({
      subject,
      body_html: bodyHtml,
      sent_to_count: sentCount,
      sent_at: new Date().toISOString(),
      status: errors.length === 0 ? "sent" : sentCount > 0 ? "sent" : "failed",
    });

    return NextResponse.json({ ok: true, sentCount, total: subscribers.length, errors });
  } catch (e) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
