import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import GuideHeader from "@/components/GuideHeader";
import GuideBody from "@/components/GuideBody";
import TableOfContents from "@/components/TableOfContents";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sb = await createSupabaseServer();
  const { data: guide } = await sb
    .from("contents")
    .select("title, summary, hook, media_urls, tags")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!guide) return {};

  const description = guide.summary || guide.hook || "";
  const ogImage = guide.media_urls?.[0];

  return {
    title: `${guide.title} — brxce.ai`,
    description,
    keywords: guide.tags || [],
    openGraph: {
      title: guide.title,
      description,
      type: "article",
      url: `https://brxce.ai/guides/${slug}`,
      locale: "ko_KR",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      site: "@brxce_ai",
      title: guide.title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
    alternates: { canonical: `https://brxce.ai/guides/${slug}` },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const sb = await createSupabaseServer();
  const { data: guide } = await sb
    .from("contents")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!guide) notFound();

  // Related guides (same tags)
  let relatedGuides: typeof guide[] = [];
  if (guide.tags?.length) {
    const { data } = await sb
      .from("contents")
      .select("id, title, slug, hook, summary, media_urls, created_at")
      .eq("status", "published")
      .neq("id", guide.id)
      .overlaps("tags", guide.tags)
      .limit(3);
    relatedGuides = data || [];
  }

  // Extract TOC from markdown
  const headings = extractHeadings(guide.body_md || "");

  return (
    <>
      <GuideHeader />
      <div className="max-w-[1100px] mx-auto px-6 py-12 flex gap-10">
        {/* TOC sidebar — desktop only */}
        {headings.length > 0 && (
          <aside className="hidden lg:block w-[220px] shrink-0 sticky top-[80px] self-start max-h-[calc(100vh-100px)] overflow-y-auto">
            <TableOfContents headings={headings} />
          </aside>
        )}

        <article className="max-w-[680px] w-full mx-auto min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-6 text-[13px] text-[#666]">
            {guide.category && (
              <>
                <span className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-2.5 py-0.5 text-xs text-[#888]">
                  {guide.category}
                </span>
                <span className="text-[#333]">·</span>
              </>
            )}
            <span>{new Date(guide.created_at).toLocaleDateString("ko-KR")}</span>
          </div>

          <h1 className="text-[32px] font-bold leading-tight mb-3 tracking-tight">{guide.title}</h1>
          {guide.hook && <p className="text-[17px] text-[#888] mb-6 leading-relaxed">{guide.hook}</p>}

          {/* Tags */}
          {guide.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-8">
              {guide.tags.map((t: string) => (
                <Link
                  key={t}
                  href={`/guides?tag=${encodeURIComponent(t)}`}
                  className="inline-block px-2.5 py-0.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[11px] text-[#888] no-underline hover:text-[#ccc] hover:border-[#444] transition-colors"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}

          <hr className="border-none h-px bg-[#1a1a1a] my-8" />

          {/* Body */}
          <GuideBody content={guide.body_md || ""} />

          {/* CTA */}
          {guide.cta && (
            <div className="bg-[#111] border border-[#333] rounded-[14px] p-8 text-center mt-12">
              <h3 className="text-xl font-bold mb-2">🦞 더 깊은 가이드가 필요하신가요?</h3>
              <p className="text-[15px] text-[#888] mb-5">{guide.cta}</p>
              <a href="/" className="inline-block px-8 py-3.5 rounded-[10px] bg-[#fafafa] text-[#0a0a0a] text-[15px] font-semibold no-underline hover:bg-[#e0e0e0] transition-colors">
                brxce.ai에서 등록하기
              </a>
            </div>
          )}

          {/* Author */}
          <div className="flex items-center gap-3.5 mt-12 p-5 bg-[#111] border border-[#1a1a1a] rounded-xl">
            <Image src="/profile.jpg" alt="Bruce Choe" width={48} height={48} className="rounded-full border border-[#333]" />
            <div>
              <div className="font-semibold text-sm">Bruce Choe</div>
              <p className="text-[13px] text-[#888] mt-0.5">
                OpenClaw × ClaudeCode로 회사를 굴리는 개발자 CEO.
              </p>
            </div>
          </div>

          {/* Related Guides */}
          {relatedGuides.length > 0 && (
            <div className="mt-14">
              <h2 className="text-xl font-bold mb-6">관련 가이드</h2>
              <div className="flex flex-col gap-3">
                {relatedGuides.map((r) => (
                  <Link
                    key={r.id}
                    href={`/guides/${r.slug || r.id}`}
                    className="block p-5 bg-[#111] border border-[#1a1a1a] rounded-xl no-underline text-[#ccc] hover:border-[#333] hover:text-[#fafafa] transition-all"
                  >
                    <div className="text-[15px] font-medium">{r.title}</div>
                    {(r.summary || r.hook) && (
                      <div className="text-[13px] text-[#888] mt-1 line-clamp-1">{r.summary || r.hook}</div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      <footer className="max-w-[680px] mx-auto px-6 py-6 text-center text-xs text-[#444] border-t border-[#1a1a1a]">
        © 2026 Bruce Choe · <a href="/" className="text-[#555] no-underline hover:text-[#888]">brxce.ai</a>
      </footer>
    </>
  );
}

function extractHeadings(md: string): { level: number; text: string; id: string }[] {
  const lines = md.split("\n");
  const headings: { level: number; text: string; id: string }[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (match) {
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.push({ level: match[1].length, text, id });
    }
  }
  return headings;
}
