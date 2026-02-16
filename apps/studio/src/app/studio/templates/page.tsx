"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Template = {
  name: string;
  description: string;
  category: string;
  href?: string;
  comingSoon?: boolean;
};

const IMAGE_TEMPLATES: Template[] = [
  // 다이어그램
  { name: "Comparison", description: "두 항목 비교 다이어그램", category: "다이어그램", href: "/diagrams" },
  { name: "OrgChart", description: "조직도 / 계층 구조", category: "다이어그램", href: "/diagrams" },
  { name: "BeforeAfter", description: "Before/After 비교", category: "다이어그램", href: "/diagrams" },
  { name: "FlowChart", description: "프로세스 흐름도", category: "다이어그램", href: "/diagrams" },
  // 엔진 이미지
  { name: "OG Image", description: "Open Graph 소셜 미리보기 이미지", category: "엔진", comingSoon: true },
  { name: "Thumbnail", description: "유튜브/블로그 썸네일", category: "엔진", comingSoon: true },
  { name: "Quote", description: "인용구 카드", category: "엔진", comingSoon: true },
  { name: "Social Post", description: "소셜 미디어용 정사각형 이미지", category: "엔진", comingSoon: true },
  { name: "Infographic", description: "데이터 시각화 인포그래픽", category: "엔진", comingSoon: true },
];

const CAROUSEL_TEMPLATES: Template[] = [
  { name: "CardNews", description: "카드뉴스 형태 캐러셀", category: "캐러셀", comingSoon: true },
  { name: "StepByStep", description: "단계별 가이드", category: "캐러셀", comingSoon: true },
  { name: "ListCarousel", description: "리스트형 슬라이드", category: "캐러셀", comingSoon: true },
  { name: "BeforeAfter", description: "Before/After 슬라이드", category: "캐러셀", comingSoon: true },
  { name: "QuoteCarousel", description: "명언/인용 캐러셀", category: "캐러셀", comingSoon: true },
];

const VIDEO_TEMPLATES: Template[] = [
  { name: "TextOverVideo", description: "텍스트 오버레이 영상", category: "영상", comingSoon: true },
  { name: "NewsBreaking", description: "뉴스 속보 스타일", category: "영상", comingSoon: true },
  { name: "VSReel", description: "VS 비교 릴스", category: "영상", comingSoon: true },
  { name: "ShortFormVideo", description: "숏폼 세로 영상", category: "영상", comingSoon: true },
  { name: "Demo60s", description: "60초 데모 영상", category: "영상", comingSoon: true },
  { name: "DayInTheLife", description: "일상 브이로그 스타일", category: "영상", comingSoon: true },
];

const TABS = [
  { key: "image", label: "이미지", icon: "🖼️" },
  { key: "carousel", label: "캐러셀", icon: "📱" },
  { key: "video", label: "영상", icon: "🎬" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const TAB_DATA: Record<TabKey, Template[]> = {
  image: IMAGE_TEMPLATES,
  carousel: CAROUSEL_TEMPLATES,
  video: VIDEO_TEMPLATES,
};

export default function TemplatesPage() {
  const searchParams = useSearchParams();
  const initial = (searchParams.get("tab") as TabKey) || "image";
  const [tab, setTab] = useState<TabKey>(initial);

  const templates = TAB_DATA[tab];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#fafafa]">템플릿</h1>

      {/* 탭 */}
      <div className="flex gap-1 bg-[#111] p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border-none cursor-pointer ${
              tab === t.key
                ? "bg-[#1a1a1a] text-[#fafafa]"
                : "bg-transparent text-[#666] hover:text-[#aaa]"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tmpl) => (
          <div
            key={tmpl.name}
            className="p-5 bg-[#1a1a1a] rounded-xl border border-[#222] flex flex-col"
          >
            {/* 미리보기 placeholder */}
            <div className="w-full aspect-video bg-[#111] rounded-lg mb-4 flex items-center justify-center text-2xl text-[#333]">
              {tab === "image" ? "🖼️" : tab === "carousel" ? "📱" : "🎬"}
            </div>

            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[#fafafa] font-semibold text-sm">{tmpl.name}</h3>
              {tmpl.category && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222] text-[#666]">{tmpl.category}</span>
              )}
            </div>
            <p className="text-[#666] text-xs mb-4 flex-1">{tmpl.description}</p>

            {tmpl.href ? (
              <Link
                href={tmpl.href}
                className="px-3 py-2 bg-[#FF6B35] text-white rounded-lg text-xs font-medium no-underline hover:opacity-90 transition-opacity text-center"
              >
                사용하기
              </Link>
            ) : (
              <button
                disabled
                className="px-3 py-2 bg-[#222] text-[#555] rounded-lg text-xs font-medium border-none cursor-not-allowed"
              >
                Coming soon
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
