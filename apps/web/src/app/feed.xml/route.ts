import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: guides } = await supabase
    .from("contents")
    .select("title, slug, hook, created_at, updated_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (guides || [])
    .map((g) => {
      const pubDate = new Date(g.created_at).toUTCString();
      const desc = g.hook || "";
      return `    <item>
      <title><![CDATA[${g.title}]]></title>
      <link>https://brxce.ai/guides/${g.slug}</link>
      <guid isPermaLink="true">https://brxce.ai/guides/${g.slug}</guid>
      <description><![CDATA[${desc}]]></description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>brxce.ai — 에이전틱 워크플로우</title>
    <link>https://brxce.ai</link>
    <description>에이전틱 워크플로우 실전 가이드 — Bruce Choe</description>
    <language>ko</language>
    <atom:link href="https://brxce.ai/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
