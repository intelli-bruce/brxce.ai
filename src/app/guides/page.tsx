import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";
import GuideHeader from "@/components/GuideHeader";

export const revalidate = 60;

export default async function GuidesPage() {
  const sb = await createSupabaseServer();
  const { data: guides } = await sb
    .from("contents")
    .select("id, title, slug, hook, category, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <>
      <GuideHeader />
      <main className="max-w-[680px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">가이드</h1>
        <p className="text-[#888] mb-10">에이전틱 워크플로우 실전 가이드 모음</p>

        {!guides || guides.length === 0 ? (
          <p className="text-[#666]">아직 공개된 가이드가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {guides.map((g) => (
              <Link
                key={g.id}
                href={`/guides/${g.slug || g.id}`}
                className="block p-5 bg-[#111] border border-[#1a1a1a] rounded-xl no-underline text-[#ccc] hover:border-[#333] hover:text-[#fafafa] transition-all"
              >
                <div className="text-[15px] font-medium">{g.title}</div>
                {g.hook && <div className="text-[13px] text-[#888] mt-1">{g.hook}</div>}
                <div className="text-xs text-[#555] mt-2">
                  {g.category && <span>{g.category} · </span>}
                  {new Date(g.created_at).toLocaleDateString("ko-KR")}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
