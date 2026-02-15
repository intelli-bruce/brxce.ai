import Link from "next/link";
import Image from "next/image";
import { createSupabaseServer } from "@/lib/supabase-server";

export default async function LatestGuides() {
  const sb = await createSupabaseServer();
  const { data: guides } = await sb
    .from("contents")
    .select("id, title, slug, hook, summary, media_urls, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(4);

  if (!guides || guides.length === 0) return null;

  return (
    <section className="w-full mt-10">
      <div className="flex items-center gap-3 mb-5 text-[13px] font-semibold text-[#888] tracking-wide">
        <span className="flex-1 h-px bg-[#333]" />
        최신 가이드
        <span className="flex-1 h-px bg-[#333]" />
      </div>

      <div className="flex flex-col gap-3">
        {guides.map((g) => (
          <Link
            key={g.id}
            href={`/guides/${g.slug || g.id}`}
            className="block p-4 bg-[#111] border border-[#1a1a1a] rounded-xl no-underline text-[#ccc] hover:border-[#333] hover:text-[#fafafa] transition-all"
          >
            <div className="text-[15px] font-medium">{g.title}</div>
            {(g.summary || g.hook) && (
              <div className="text-[13px] text-[#888] mt-1 line-clamp-1">{g.summary || g.hook}</div>
            )}
            <div className="text-[11px] text-[#555] mt-2">
              {new Date(g.created_at).toLocaleDateString("ko-KR")}
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/guides"
        className="block mt-4 text-center text-[13px] text-[#888] no-underline hover:text-[#fafafa] transition-colors"
      >
        더 보기 →
      </Link>
    </section>
  );
}
