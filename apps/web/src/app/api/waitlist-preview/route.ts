import { NextRequest, NextResponse } from "next/server";
import { getWaitlistTemplate, waitlistEmailHtml } from "@/lib/waitlist-email-templates";

export async function GET(req: NextRequest) {
  const product = req.nextUrl.searchParams.get("product") || "default";
  const template = getWaitlistTemplate(product);
  const html = waitlistEmailHtml(template);
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
