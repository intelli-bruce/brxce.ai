import { createSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 3600;

export async function GET() {
  const sb = await createSupabaseServer();
  const { data: guides } = await sb
    .from("contents")
    .select("title, slug, summary, hook, created_at, category, tags")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (guides || [])
    .map((g) => {
      const desc = g.summary || g.hook || "";
      const url = `https://brxce.ai/guides/${g.slug}`;
      const date = new Date(g.created_at).toUTCString();
      const categories = [g.category, ...(g.tags || [])]
        .filter(Boolean)
        .map((c) => `<category>${escXml(c)}</category>`)
        .join("");
      return `<item>
  <title>${escXml(g.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <description>${escXml(desc)}</description>
  <pubDate>${date}</pubDate>
  ${categories}
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>brxce.ai 가이드</title>
  <link>https://brxce.ai/guides</link>
  <description>에이전틱 워크플로우 실전 가이드 — Bruce Choe</description>
  <language>ko</language>
  <atom:link href="https://brxce.ai/api/feed" rel="self" type="application/rss+xml"/>
  ${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
