import Link from "next/link";
import Image from "next/image";
import { createSupabaseServer } from "@/lib/supabase-server";
import GuideHeader from "@/components/GuideHeader";
import TagFilter from "@/components/TagFilter";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "가이드 — brxce.ai",
  description: "에이전틱 워크플로우 실전 가이드 모음. OpenClaw × ClaudeCode로 AI 에이전트를 직접 세팅하는 방법을 공유합니다.",
  openGraph: {
    title: "가이드 — brxce.ai",
    description: "에이전틱 워크플로우 실전 가이드 모음",
    type: "website",
    url: "https://brxce.ai/guides",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    site: "@brxce_ai",
    title: "가이드 — brxce.ai",
    description: "에이전틱 워크플로우 실전 가이드 모음",
  },
  alternates: { canonical: "https://brxce.ai/guides" },
};

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; category?: string }>;
}) {
  const { tag, category } = await searchParams;
  const sb = await createSupabaseServer();

  let query = sb
    .from("contents")
    .select("id, title, slug, hook, summary, category, tags, media_urls, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data: guides } = await query;

  // Collect all unique tags and categories
  const allTags = new Set<string>();
  const allCategories = new Set<string>();
  guides?.forEach((g) => {
    if (g.category) allCategories.add(g.category);
    if (g.tags && Array.isArray(g.tags)) {
      g.tags.forEach((t: string) => allTags.add(t));
    }
  });

  return (
    <>
      <GuideHeader />
      <main className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">가이드</h1>
        <p className="text-[#888] mb-8">에이전틱 워크플로우 실전 가이드 모음</p>

        <TagFilter
          tags={Array.from(allTags)}
          categories={Array.from(allCategories)}
          activeTag={tag}
          activeCategory={category}
        />

        {!guides || guides.length === 0 ? (
          <p className="text-[#666] mt-10">아직 공개된 가이드가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
            {guides.map((g) => {
              const thumbnail = g.media_urls?.[0];
              return (
                <Link
                  key={g.id}
                  href={`/guides/${g.slug || g.id}`}
                  className="group block bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden no-underline text-[#ccc] hover:border-[#333] hover:text-[#fafafa] transition-all"
                >
                  {thumbnail && (
                    <div className="relative w-full aspect-[16/9] bg-[#0a0a0a]">
                      <Image
                        src={thumbnail}
                        alt={g.title}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 450px"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="text-[16px] font-semibold leading-snug mb-2">{g.title}</div>
                    {(g.summary || g.hook) && (
                      <div className="text-[14px] text-[#888] leading-relaxed mb-3 line-clamp-2">
                        {g.summary || g.hook}
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {g.tags?.slice(0, 3).map((t: string) => (
                        <span
                          key={t}
                          className="inline-block px-2 py-0.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[11px] text-[#888]"
                        >
                          {t}
                        </span>
                      ))}
                      <span className="text-[12px] text-[#555] ml-auto">
                        {new Date(g.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
