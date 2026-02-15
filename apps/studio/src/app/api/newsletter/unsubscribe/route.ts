import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  try {
    const email = Buffer.from(token, "base64url").toString("utf-8");
    const sb = createSupabaseAdmin();

    await sb
      .from("subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    // Redirect to unsubscribe confirmation page
    return NextResponse.redirect(new URL(`/newsletter/unsubscribe?done=1`, req.url));
  } catch {
    return NextResponse.json({ error: "처리 중 오류" }, { status: 500 });
  }
}
