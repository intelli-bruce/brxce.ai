"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

/* ── Template Registry ── */
const TEMPLATES = {
  diagram: [
    { name: "Comparison", desc: "3단 비교 다이어그램", layout: "3컬럼 카드+리스트+화살표", ratios: ["guide 3:2", "blog 16:9", "square 1:1"], sketch: true },
    { name: "OrgChart", desc: "허브-스포크 조직도", layout: "중앙 허브 + 방사형 노드", ratios: ["guide 3:2", "wide 21:9"], sketch: true },
    { name: "BeforeAfter", desc: "전후 비교", layout: "2패널 + 큰 화살표", ratios: ["guide 3:2", "blog 16:9"], sketch: true },
    { name: "FlowChart", desc: "프로세스 흐름도", layout: "React Flow 노드+엣지", ratios: ["guide 3:2", "blog 16:9"], sketch: false },
  ],
  image: [
    { name: "OgImage", desc: "Open Graph 소셜 미리보기", layout: "타이틀+브랜드 오버레이", ratios: ["1200×630"] },
    { name: "Thumbnail", desc: "YouTube/블로그 썸네일", layout: "배경+텍스트+뱃지", ratios: ["1280×720"] },
    { name: "Quote", desc: "인용구 카드", layout: "인용문+저자+브랜딩", ratios: ["1080×1080"] },
    { name: "SocialPost", desc: "소셜 정사각형 이미지", layout: "텍스트+배경+CTA", ratios: ["1080×1080"] },
    { name: "Infographic", desc: "데이터 시각화", layout: "섹션별 데이터 블록", ratios: ["1080×1920"] },
  ],
  carousel: [
    { name: "CardNews", desc: "카드뉴스 캐러셀", layout: "제목→본문→CTA 슬라이드", ratios: ["1080×1350 (4:5)"] },
    { name: "StepByStep", desc: "단계별 가이드", layout: "번호+설명 각 슬라이드", ratios: ["1080×1350"] },
    { name: "ListCarousel", desc: "리스트형 슬라이드", layout: "항목 리스트 카드", ratios: ["1080×1350"] },
    { name: "BeforeAfter", desc: "전후 비교 슬라이드", layout: "Before→After 페어", ratios: ["1080×1350"] },
    { name: "QuoteCarousel", desc: "명언/인용 캐러셀", layout: "인용문+출처 반복", ratios: ["1080×1350"] },
  ],
  video: [
    { name: "VSReel", desc: "VS 비교 릴스", layout: "좌우 분할 비교+점수", ratios: ["1080×1920 (9:16)"] },
    { name: "NewsBreaking", desc: "뉴스 속보 스타일", layout: "브레이킹 배너+텍스트", ratios: ["1080×1920"] },
    { name: "ShortFormVideo", desc: "숏폼 세로 영상", layout: "캡션 오버레이", ratios: ["1080×1920"] },
    { name: "Demo60s", desc: "60초 데모", layout: "화면 녹화+자막", ratios: ["1080×1920"] },
    { name: "DayInTheLife", desc: "일상 브이로그", layout: "시간대별 클립", ratios: ["1080×1920"] },
    { name: "TextOverVideo", desc: "텍스트 오버레이", layout: "배경 영상+타이포", ratios: ["1080×1920"] },
  ],
};

const CATEGORY_META: Record<string, { icon: string; label: string; color: string }> = {
  diagram: { icon: "📐", label: "다이어그램", color: "text-blue-400 bg-blue-500/10" },
  image: { icon: "🖼️", label: "이미지", color: "text-purple-400 bg-purple-500/10" },
  carousel: { icon: "📱", label: "캐러셀", color: "text-green-400 bg-green-500/10" },
  video: { icon: "🎬", label: "영상", color: "text-orange-400 bg-orange-500/10" },
};

type RecentAsset = {
  id: string;
  asset_type: string;
  storage_url: string;
  file_name: string | null;
  campaign_id: string | null;
  content_id: string | null;
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
      .then((r) => {
        setAssets((r.data ?? []) as RecentAsset[]);
        setLoading(false);
      });
  }, []);

  const totalTemplates = Object.values(TEMPLATES).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-[#fafafa]">스튜디오</h1>
        <p className="text-sm text-[#666] mt-1">템플릿 카탈로그 · 작업 현황 · 산출물 추적</p>
      </div>

      {/* ── 템플릿 오버뷰 ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#fafafa]">템플릿 카탈로그</h2>
          <span className="text-xs text-[#666]">총 {totalTemplates}개</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Object.entries(TEMPLATES).map(([cat, items]) => {
            const meta = CATEGORY_META[cat];
            return (
              <Link
                key={cat}
                href={`/studio/templates?tab=${cat}`}
                className="block p-5 bg-[#111] rounded-xl border border-[#222] hover:border-[#333] transition-colors no-underline group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${meta.color}`}>
                    {meta.icon} {meta.label}
                  </span>
                  <span className="text-sm font-mono text-[#FF6B35]">{items.length}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((t) => (
                    <div key={t.name} className="flex items-center gap-2">
                      <span className="text-xs text-[#ccc] group-hover:text-[#fafafa] transition-colors">{t.name}</span>
                      <span className="text-[10px] text-[#555]">—</span>
                      <span className="text-[10px] text-[#555] truncate">{t.desc}</span>
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 최근 산출물 ── */}
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
            <p className="text-[#666] text-sm">아직 산출물이 없습니다</p>
            <p className="text-[#555] text-xs mt-1">에이전트가 콘텐츠를 생성하면 여기에 표시됩니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {assets.map((a) => (
              <div key={a.id} className="bg-[#111] rounded-lg border border-[#222] overflow-hidden group">
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
                    <p className="text-[9px] text-[#555] truncate mt-0.5">
                      {a.campaign?.title || a.content?.title}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 에이전트 작업 안내 ── */}
      <section className="p-5 bg-[#111] rounded-xl border border-[#222]">
        <h3 className="text-sm font-semibold text-[#fafafa] mb-2">🤖 에이전트 워크플로우</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#888]">
          <div>
            <p className="text-[#ccc] font-medium mb-1">1. 콘텐츠 기획</p>
            <p>캠페인 → 원자(atom) 생성 → 포맷/채널 결정</p>
          </div>
          <div>
            <p className="text-[#ccc] font-medium mb-1">2. 템플릿 선택 & 렌더</p>
            <p>에이전트가 적합한 템플릿 + 데이터로 미디어 생성</p>
          </div>
          <div>
            <p className="text-[#ccc] font-medium mb-1">3. 리뷰 & 발행</p>
            <p>미리보기 확인 → 피드백 → 수정 → 승인 → 발행</p>
          </div>
        </div>
      </section>
    </div>
  );
}
