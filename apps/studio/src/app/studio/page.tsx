"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const CATEGORY_META = [
  { key: "image", icon: "🖼️", label: "이미지", count: 9, color: "text-purple-400 bg-purple-500/10", desc: "다이어그램 · 커버 · 소셜 · 인포그래픽" },
  { key: "carousel", icon: "📱", label: "캐러셀", count: 5, color: "text-green-400 bg-green-500/10", desc: "CardNews · StepByStep · List · Quote" },
  { key: "video", icon: "🎬", label: "영상", count: 6, color: "text-orange-400 bg-orange-500/10", desc: "VSReel · NewsBreaking · ShortForm · Demo" },
];

type RecentAsset = {
  id: string;
  asset_type: string;
  storage_url: string;
  file_name: string | null;
  created_at: string;
  campaign?: { title: string } | null;
  content?: { title: string } | null;
};

export default function StudioPage() {
  const [assets, setAssets] = useState<RecentAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createSupabaseBrowser();
    sb.from("media_assets")
      .select("*, campaign:campaigns(title), content:contents(title)")
      .order("created_at", { ascending: false })
      .limit(12)
      .then((r) => { setAssets((r.data ?? []) as RecentAsset[]); setLoading(false); });
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-[#fafafa]">스튜디오</h1>
        <p className="text-sm text-[#666] mt-1">템플릿 카탈로그 · 산출물 추적</p>
      </div>

      {/* Template categories */}
      <section>
        <h2 className="text-lg font-semibold text-[#fafafa] mb-4">템플릿</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CATEGORY_META.map((c) => (
            <Link key={c.key} href={`/studio/templates?tab=${c.key}`}
              className="block p-5 bg-[#111] rounded-xl border border-[#222] hover:border-[#333] transition no-underline group">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.color}`}>{c.icon} {c.label}</span>
                <span className="text-sm font-mono text-[#FF6B35]">{c.count}</span>
              </div>
              <p className="text-xs text-[#666]">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent outputs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#fafafa]">최근 산출물</h2>
          <Link href="/media" className="text-xs text-[#FF6B35] no-underline hover:underline">미디어 라이브러리 →</Link>
        </div>
        {loading ? (
          <div className="text-[#555] text-sm">로딩 중...</div>
        ) : assets.length === 0 ? (
          <div className="text-center py-12 bg-[#111] rounded-xl border border-[#222]">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-[#666] text-sm">에이전트가 콘텐츠를 생성하면 여기에 표시됩니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {assets.map((a) => (
              <div key={a.id} className="bg-[#111] rounded-lg border border-[#222] overflow-hidden">
                <div className="aspect-square bg-[#0a0a0a] flex items-center justify-center">
                  {a.storage_url && /\.(jpg|jpeg|png|gif|webp|svg)/.test(a.storage_url) ? (
                    <img src={a.storage_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-[#333] text-lg">{a.asset_type === "video" ? "🎬" : "🖼️"}</span>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-[10px] text-[#ccc] truncate">{a.file_name || a.asset_type}</p>
                  {(a.campaign?.title || a.content?.title) && (
                    <p className="text-[9px] text-[#555] truncate mt-0.5">{a.campaign?.title || a.content?.title}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Agent workflow */}
      <section className="p-5 bg-[#111] rounded-xl border border-[#222]">
        <h3 className="text-sm font-semibold text-[#fafafa] mb-2">🤖 에이전트 워크플로우</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#888]">
          <div><p className="text-[#ccc] font-medium mb-1">1. 콘텐츠 기획</p><p>캠페인 → 원자 생성 → 포맷/채널 결정</p></div>
          <div><p className="text-[#ccc] font-medium mb-1">2. 템플릿 선택 & 렌더</p><p>에이전트가 적합한 템플릿 + 데이터로 미디어 생성</p></div>
          <div><p className="text-[#ccc] font-medium mb-1">3. 리뷰 & 발행</p><p>미리보기 확인 → 피드백 → 승인 → 발행</p></div>
        </div>
      </section>
    </div>
  );
}
