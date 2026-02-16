"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

/* ── 템플릿 데이터 ── */
const IMAGE_TEMPLATES = {
  diagrams: ["Comparison", "OrgChart", "BeforeAfter", "FlowChart"],
  engine: ["OgImage", "Thumbnail", "Quote", "SocialPost", "Infographic"],
};
const CAROUSEL_TEMPLATES = ["CardNews", "StepByStep", "ListCarousel", "BeforeAfter", "QuoteCarousel"];
const VIDEO_TEMPLATES = ["TextOverVideo", "NewsBreaking", "VSReel", "ShortFormVideo", "Demo60s", "DayInTheLife"];

type Project = {
  id: string;
  title: string;
  type: string;
  status: string;
  config: Record<string, unknown> | null;
  created_at: string;
};

type MediaAsset = {
  id: string;
  title: string;
  type: string;
  url: string;
  created_at: string;
};

export default function StudioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createSupabaseBrowser();
    Promise.all([
      sb.from("studio_projects").select("*").eq("status", "active").order("created_at", { ascending: false }),
      sb.from("media_assets").select("*").order("created_at", { ascending: false }).limit(10),
    ]).then(([p, m]) => {
      setProjects((p.data ?? []) as Project[]);
      setAssets((m.data ?? []) as MediaAsset[]);
      setLoading(false);
    });
  }, []);

  const TYPE_ICON: Record<string, string> = { video: "🎬", carousel: "📱", image: "🖼️" };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#fafafa]">스튜디오</h1>
      </div>

      {/* 빠른 작업 */}
      <div className="flex gap-3">
        <Link href="/diagrams" className="px-4 py-2.5 bg-[#FF6B35] text-white rounded-lg text-sm font-medium no-underline hover:opacity-90 transition-opacity">
          + 새 다이어그램
        </Link>
        <button className="px-4 py-2.5 bg-[#1a1a1a] text-[#888] border border-[#333] rounded-lg text-sm cursor-not-allowed" disabled>
          캐러셀 렌더
        </button>
        <button className="px-4 py-2.5 bg-[#1a1a1a] text-[#888] border border-[#333] rounded-lg text-sm cursor-not-allowed" disabled>
          영상 렌더
        </button>
      </div>

      {/* 작업 중인 항목 */}
      <section>
        <h2 className="text-lg font-semibold text-[#fafafa] mb-4">작업 중인 항목</h2>
        {loading ? (
          <div className="text-[#555] text-sm">로딩 중...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-[#111] rounded-xl border border-[#222]">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-[#666] text-sm">활성 작업이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/studio/${p.id}`}
                className="block p-4 bg-[#1a1a1a] rounded-xl border border-[#222] hover:border-[#333] transition-colors no-underline"
              >
                <span className="text-xl">{TYPE_ICON[p.type] ?? "📄"}</span>
                <h3 className="text-[#fafafa] font-medium text-sm mt-2 truncate">{p.title}</h3>
                <p className="text-[#555] text-xs mt-1">{new Date(p.created_at).toLocaleDateString("ko-KR")}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 최근 산출물 */}
      <section>
        <h2 className="text-lg font-semibold text-[#fafafa] mb-4">최근 산출물</h2>
        {loading ? (
          <div className="text-[#555] text-sm">로딩 중...</div>
        ) : assets.length === 0 ? (
          <div className="text-center py-8 bg-[#111] rounded-xl border border-[#222]">
            <p className="text-[#666] text-sm">산출물 없음</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {assets.map((a) => (
              <div key={a.id} className="p-3 bg-[#1a1a1a] rounded-lg border border-[#222]">
                <div className="w-full aspect-video bg-[#111] rounded mb-2" />
                <p className="text-[#ccc] text-xs truncate">{a.title ?? a.type}</p>
                <p className="text-[#444] text-[10px]">{new Date(a.created_at).toLocaleDateString("ko-KR")}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 템플릿 현황 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#fafafa]">템플릿 현황</h2>
          <Link href="/studio/templates" className="text-xs text-[#FF6B35] no-underline hover:underline">전체 보기 →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 이미지 */}
          <div className="p-5 bg-[#1a1a1a] rounded-xl border border-[#222]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#fafafa] font-medium text-sm">🖼️ 이미지</h3>
              <span className="text-xs text-[#FF6B35] font-mono">{IMAGE_TEMPLATES.diagrams.length + IMAGE_TEMPLATES.engine.length}개</span>
            </div>
            <p className="text-[#666] text-xs mb-2">다이어그램: {IMAGE_TEMPLATES.diagrams.join(", ")}</p>
            <p className="text-[#666] text-xs">엔진: {IMAGE_TEMPLATES.engine.join(", ")}</p>
          </div>
          {/* 캐러셀 */}
          <div className="p-5 bg-[#1a1a1a] rounded-xl border border-[#222]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#fafafa] font-medium text-sm">📱 캐러셀</h3>
              <span className="text-xs text-[#FF6B35] font-mono">{CAROUSEL_TEMPLATES.length}개</span>
            </div>
            <p className="text-[#666] text-xs">{CAROUSEL_TEMPLATES.join(", ")}</p>
          </div>
          {/* 영상 */}
          <div className="p-5 bg-[#1a1a1a] rounded-xl border border-[#222]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#fafafa] font-medium text-sm">🎬 영상</h3>
              <span className="text-xs text-[#FF6B35] font-mono">{VIDEO_TEMPLATES.length}개</span>
            </div>
            <p className="text-[#666] text-xs">{VIDEO_TEMPLATES.join(", ")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
