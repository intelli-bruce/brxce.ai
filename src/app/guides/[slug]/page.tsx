import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import GuideHeader from "@/components/GuideHeader";
import Image from "next/image";
import Markdown from "react-markdown";

export const revalidate = 60;

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await createSupabaseServer();
  const { data: guide } = await sb
    .from("contents")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!guide) notFound();

  return (
    <>
      <GuideHeader />
      <article className="max-w-[680px] mx-auto px-6 py-12">
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
        {guide.hook && <p className="text-[17px] text-[#888] mb-10 leading-relaxed">{guide.hook}</p>}

        <hr className="border-none h-px bg-[#1a1a1a] my-10" />

        {/* Body */}
        <div className="prose-dark">
          <Markdown>{guide.body_md || ""}</Markdown>
        </div>

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
      </article>

      <footer className="max-w-[680px] mx-auto px-6 py-6 text-center text-xs text-[#444] border-t border-[#1a1a1a]">
        © 2026 Bruce Choe · <a href="/" className="text-[#555] no-underline hover:text-[#888]">brxce.ai</a>
      </footer>
    </>
  );
}
