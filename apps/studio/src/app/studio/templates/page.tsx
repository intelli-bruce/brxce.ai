"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

/* ── Template Data ── */
interface TemplateInfo {
  name: string;
  desc: string;
  sub: string;
  layout: string;
  ratios: string[];
  sketch?: boolean;
  propsSchema: Record<string, string>;
  sampleData: Record<string, unknown>;
  preview: PreviewSpec;
}

type PreviewSpec = {
  type: "placeholder";
  /** Rough visual structure using ASCII-art style boxes */
  blocks: string[];
  accent?: string;
};

/* ── Image Templates (Diagram + Cover + Social + Infographic) ── */
const IMAGE_TEMPLATES: TemplateInfo[] = [
  // Diagrams
  {
    name: "Comparison", sub: "다이어그램", desc: "두 항목 또는 세 항목을 나란히 비교",
    layout: "3컬럼 · 카드(제목+부제+리스트) · 컬럼간 화살표 뱃지",
    ratios: ["guide 3:2", "blog 16:9", "square 1:1"], sketch: true,
    propsSchema: { columns: "Column[] — { title, subtitle, variant?, items[] }", highlight: "number", arrows: "Arrow[] — { label }" },
    sampleData: { columns: [{ title: "수동", items: ["반복", "느림"] }, { title: "자동화", items: ["스크립트", "빠름"] }, { title: "에이전틱", items: ["자율", "학습"], variant: "highlight" }] },
    preview: { type: "placeholder", blocks: ["┌─────┐  ┌─────┐  ┌─────┐", "│ COL1│→│ COL2│→│ COL3│", "│ ··· │  │ ··· │  │ ··· │", "└─────┘  └─────┘  └─────┘"], accent: "#4C9AFF" },
  },
  {
    name: "OrgChart", sub: "다이어그램", desc: "중앙 허브에서 방사형으로 퍼지는 구조도",
    layout: "중앙 허브 카드 + 방사형 노드 + SVG 커넥터",
    ratios: ["guide 3:2", "wide 21:9"], sketch: true,
    propsSchema: { hub: "{ title, subtitle }", nodes: "Node[] — { title, subtitle }", footnote: "string" },
    sampleData: { hub: { title: "CEO" }, nodes: [{ title: "콘텐츠" }, { title: "마케팅" }, { title: "개발" }] },
    preview: { type: "placeholder", blocks: ["        ┌─────┐", "        │ HUB │", "        └──┬──┘", "     ┌─────┼─────┐", "  ┌──┴──┐┌─┴──┐┌─┴──┐", "  │ N1  ││ N2 ││ N3 │", "  └─────┘└────┘└────┘"], accent: "#69DB7C" },
  },
  {
    name: "BeforeAfter", sub: "다이어그램", desc: "두 상태를 큰 화살표로 연결하는 전후 비교",
    layout: "2패널(Before/After 카드) + LargeArrow 커넥터",
    ratios: ["guide 3:2", "blog 16:9"], sketch: true,
    propsSchema: { before: "{ title, subtitle, items[] }", after: "{ title, subtitle, items[] }", arrowLabel: "string" },
    sampleData: { before: { title: "Before", items: ["2시간 소요", "실수 빈번"] }, after: { title: "After", items: ["10분 단축", "일관된 품질"] } },
    preview: { type: "placeholder", blocks: ["┌─────────┐      ┌─────────┐", "│ BEFORE  │ ═══► │  AFTER  │", "│ · · ·   │      │ · · ·   │", "└─────────┘      └─────────┘"], accent: "#FFD43B" },
  },
  {
    name: "FlowChart", sub: "다이어그램", desc: "노드와 엣지로 구성된 프로세스 흐름도",
    layout: "React Flow 기반 · 커스텀 노드 · 디자인 토큰",
    ratios: ["guide 3:2", "blog 16:9"], sketch: false,
    propsSchema: { nodes: "FlowNode[] — { id, data, position }", edges: "FlowEdge[] — { source, target }" },
    sampleData: { nodes: [{ id: "1", data: { label: "시작" } }, { id: "2", data: { label: "처리" } }, { id: "3", data: { label: "완료" } }] },
    preview: { type: "placeholder", blocks: ["(시작) ──► (처리) ──► (완료)", "              │", "           (분기) ──► (예외)"], accent: "#B197FC" },
  },
  // Cover / Thumbnail
  {
    name: "OgImage", sub: "커버", desc: "Open Graph 소셜 미리보기 이미지 (1200×630)",
    layout: "제목 + 부제 + 브랜드 로고 오버레이",
    ratios: ["1200×630"], propsSchema: { title: "string", subtitle: "string", bgColor: "string" },
    sampleData: { title: "에이전틱 워크플로우란?", subtitle: "brxce.ai" },
    preview: { type: "placeholder", blocks: ["┌──────────────────────┐", "│                      │", "│   에이전틱 워크플로우  │", "│   ─────────────────   │", "│          brxce.ai     │", "│                      │", "└──────────────────────┘"], accent: "#FF6B35" },
  },
  {
    name: "Thumbnail", sub: "커버", desc: "YouTube/블로그 썸네일 (1280×720)",
    layout: "배경 이미지 + 타이틀 텍스트 + 뱃지",
    ratios: ["1280×720"], propsSchema: { title: "string", badge: "string", bgImage: "string" },
    sampleData: { title: "AI 에이전트 실전 가이드", badge: "NEW" },
    preview: { type: "placeholder", blocks: ["┌──────────────────────┐", "│ [NEW]                │", "│                      │", "│  AI 에이전트 실전 가이드│", "│                      │", "└──────────────────────┘"], accent: "#FF922B" },
  },
  // Social
  {
    name: "Quote", sub: "소셜", desc: "인용구 카드 (1080×1080)",
    layout: "큰 따옴표 + 인용문 + 저자 + 브랜딩",
    ratios: ["1080×1080"], propsSchema: { quote: "string", author: "string" },
    sampleData: { quote: "에이전틱 워크플로우는 자동화의 다음 단계다", author: "Bruce Choe" },
    preview: { type: "placeholder", blocks: ["┌────────────────┐", "│  ❝             │", "│  인용문 텍스트   │", "│  ...           │", "│         — 저자  │", "└────────────────┘"], accent: "#F783AC" },
  },
  {
    name: "SocialPost", sub: "소셜", desc: "소셜 미디어 정사각형 (1080×1080)",
    layout: "배경 + 메인 텍스트 + CTA",
    ratios: ["1080×1080"], propsSchema: { text: "string", cta: "string" },
    sampleData: { text: "AI 에이전트 12개가 회사를 운영한다", cta: "brxce.ai" },
    preview: { type: "placeholder", blocks: ["┌────────────────┐", "│                │", "│  메인 텍스트    │", "│                │", "│    [ CTA ]     │", "└────────────────┘"], accent: "#66D9E8" },
  },
  // Infographic
  {
    name: "Infographic", sub: "인포그래픽", desc: "데이터 시각화 세로 인포그래픽 (1080×1920)",
    layout: "섹션별 데이터 블록 세로 배치",
    ratios: ["1080×1920"], propsSchema: { title: "string", sections: "Section[] — { title, data }" },
    sampleData: { title: "2026 AI 트렌드", sections: ["에이전틱 워크플로우", "멀티모달 AI", "온디바이스 AI"] },
    preview: { type: "placeholder", blocks: ["┌──────────┐", "│  TITLE   │", "├──────────┤", "│ Section1 │", "├──────────┤", "│ Section2 │", "├──────────┤", "│ Section3 │", "└──────────┘"], accent: "#B197FC" },
  },
];

const CAROUSEL_TEMPLATES: TemplateInfo[] = [
  { name: "CardNews", sub: "카드뉴스", desc: "커버→본문→CTA 구조 캐러셀", layout: "슬라이드: 커버(제목+훅) → 본문(1포인트/장) → CTA", ratios: ["1080×1350 (4:5)"], propsSchema: { cover: "{ title, hook }", slides: "Slide[]", cta: "string" }, sampleData: {},
    preview: { type: "placeholder", blocks: ["[Cover]  [Slide1]  [Slide2]  [CTA]", "┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐", "│TITLE│  │  1  │  │  2  │  │ CTA │", "│ hook│  │point│  │point│  │  →  │", "└─────┘  └─────┘  └─────┘  └─────┘"], accent: "#69DB7C" } },
  { name: "StepByStep", sub: "가이드", desc: "단계별 가이드 캐러셀", layout: "슬라이드: 번호 + 제목 + 설명", ratios: ["1080×1350"], propsSchema: { steps: "Step[] — { number, title, desc }" }, sampleData: {},
    preview: { type: "placeholder", blocks: ["[Step1]  [Step2]  [Step3]", "┌─────┐  ┌─────┐  ┌─────┐", "│ ①   │  │ ②   │  │ ③   │", "│title│  │title│  │title│", "│desc │  │desc │  │desc │", "└─────┘  └─────┘  └─────┘"], accent: "#4C9AFF" } },
  { name: "ListCarousel", sub: "리스트", desc: "리스트형 아이템 슬라이드", layout: "슬라이드: 리스트 항목 카드", ratios: ["1080×1350"], propsSchema: { items: "ListItem[] — { title, desc }" }, sampleData: {},
    preview: { type: "placeholder", blocks: ["┌──────────┐", "│ · Item 1 │", "│ · Item 2 │", "│ · Item 3 │", "│ · Item 4 │", "└──────────┘"], accent: "#FFD43B" } },
  { name: "BeforeAfter", sub: "비교", desc: "전후 비교 슬라이드 페어", layout: "Before 슬라이드 → After 슬라이드", ratios: ["1080×1350"], propsSchema: { before: "Slide", after: "Slide" }, sampleData: {},
    preview: { type: "placeholder", blocks: ["[Before]     [After]", "┌───────┐   ┌───────┐", "│  😞   │ → │  😄   │", "│ old   │   │ new   │", "└───────┘   └───────┘"], accent: "#FF922B" } },
  { name: "QuoteCarousel", sub: "인용", desc: "명언/인용 캐러셀", layout: "각 슬라이드에 인용문+출처", ratios: ["1080×1350"], propsSchema: { quotes: "Quote[] — { text, author }" }, sampleData: {},
    preview: { type: "placeholder", blocks: ["[Quote1]     [Quote2]", "┌───────┐   ┌───────┐", "│ ❝ ... │   │ ❝ ... │", "│  —저자│   │  —저자│", "└───────┘   └───────┘"], accent: "#F783AC" } },
];

const VIDEO_TEMPLATES: TemplateInfo[] = [
  { name: "VSReel", sub: "비교", desc: "VS 비교 릴스 (좌우 분할)", layout: "좌 vs 우 비교 + 점수 + 승자 선언", ratios: ["1080×1920 (9:16)", "60fps"], propsSchema: { left: "Item", right: "Item", rounds: "Round[]" }, sampleData: {},
    preview: { type: "placeholder", blocks: ["┌────┬────┐", "│ VS │ VS │", "│ L  │ R  │", "│    │    │", "│ 3  │ 5  │", "│   WINNER│", "└────┴────┘"], accent: "#FF6B35" } },
  { name: "NewsBreaking", sub: "뉴스", desc: "뉴스 속보 스타일", layout: "BREAKING 배너 + 슬라이딩 텍스트", ratios: ["1080×1920"], propsSchema: { headline: "string", body: "string" }, sampleData: {},
    preview: { type: "placeholder", blocks: ["┌──────────┐", "│ BREAKING │", "│══════════│", "│ headline │", "│          │", "│  body... │", "└──────────┘"], accent: "#FF922B" } },
  { name: "ShortFormVideo", sub: "숏폼", desc: "숏폼 세로 영상 + 자막", layout: "배경 영상/색상 + 자막 오버레이", ratios: ["1080×1920"], propsSchema: { captions: "Caption[]", bgVideo: "string" }, sampleData: {},
    preview: { type: "placeholder", blocks: ["┌──────────┐", "│          │", "│  [video] │", "│          │", "│ ───────  │", "│ caption  │", "└──────────┘"], accent: "#66D9E8" } },
  { name: "Demo60s", sub: "데모", desc: "60초 데모 영상", layout: "화면 녹화 + 줌인 + 자막", ratios: ["1080×1920"], propsSchema: { screenRecording: "string", annotations: "Annotation[]" }, sampleData: {},
    preview: { type: "placeholder", blocks: ["┌──────────┐", "│ ┌──────┐ │", "│ │screen│ │", "│ │ rec  │ │", "│ └──────┘ │", "│ 🔍 zoom  │", "└──────────┘"], accent: "#B197FC" } },
  { name: "DayInTheLife", sub: "브이로그", desc: "일상 브이로그 스타일", layout: "시간대별 클립 + 시계 UI", ratios: ["1080×1920"], propsSchema: { clips: "Clip[] — { time, desc }" }, sampleData: {},
    preview: { type: "placeholder", blocks: ["┌──────────┐", "│  ⏰ 09:00 │", "│  [clip1] │", "│  ⏰ 12:00 │", "│  [clip2] │", "│  ⏰ 18:00 │", "└──────────┘"], accent: "#69DB7C" } },
  { name: "TextOverVideo", sub: "타이포", desc: "배경 영상 위 대형 타이포그래피", layout: "배경 영상 + 텍스트 애니메이션", ratios: ["1080×1920"], propsSchema: { texts: "TextFrame[]", bgVideo: "string" }, sampleData: {},
    preview: { type: "placeholder", blocks: ["┌──────────┐", "│          │", "│  BIG     │", "│  TEXT    │", "│          │", "│ [video]  │", "└──────────┘"], accent: "#FFD43B" } },
];

const TABS = [
  { key: "image", label: "이미지", icon: "🖼️", data: IMAGE_TEMPLATES },
  { key: "carousel", label: "캐러셀", icon: "📱", data: CAROUSEL_TEMPLATES },
  { key: "video", label: "영상", icon: "🎬", data: VIDEO_TEMPLATES },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ── Sub-category grouping ── */
function groupBySub(templates: TemplateInfo[]): Map<string, TemplateInfo[]> {
  const map = new Map<string, TemplateInfo[]>();
  for (const t of templates) {
    if (!map.has(t.sub)) map.set(t.sub, []);
    map.get(t.sub)!.push(t);
  }
  return map;
}

/* ── Preview Block (ASCII layout visualization) ── */
function PreviewBlock({ preview }: { preview: PreviewSpec }) {
  return (
    <div className="bg-[#0a0a0a] rounded-lg p-4 font-mono text-[11px] leading-relaxed overflow-x-auto border border-[#1a1a1a]"
      style={{ color: preview.accent || "#555" }}>
      {preview.blocks.map((line, i) => (
        <div key={i} className="whitespace-pre">{line}</div>
      ))}
    </div>
  );
}

export default function TemplatesPage() {
  const searchParams = useSearchParams();
  const initial = (searchParams.get("tab") as TabKey) || "image";
  const [tab, setTab] = useState<TabKey>(initial);
  const [expanded, setExpanded] = useState<string | null>(null);

  const templates = TABS.find((t) => t.key === tab)?.data ?? [];
  const groups = groupBySub(templates);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#fafafa]">템플릿 카탈로그</h1>
        <p className="text-sm text-[#666] mt-1">각 템플릿의 구조, 레이아웃, 미리보기를 확인합니다</p>
      </div>

      {/* 3 Tabs */}
      <div className="flex gap-1 bg-[#111] p-1 rounded-lg w-fit border border-[#222]">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setExpanded(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border-none cursor-pointer ${
              tab === t.key ? "bg-[#222] text-[#fafafa]" : "bg-transparent text-[#666] hover:text-[#aaa]"
            }`}>
            {t.icon} {t.label} <span className="text-[10px] ml-1 text-[#555]">{t.data.length}</span>
          </button>
        ))}
      </div>

      {/* Grouped template cards */}
      {Array.from(groups.entries()).map(([subLabel, items]) => (
        <div key={subLabel}>
          <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">{subLabel}</h3>
          <div className="space-y-3 mb-8">
            {items.map((tmpl) => {
              const isExpanded = expanded === tmpl.name;
              return (
                <div key={tmpl.name} className="bg-[#111] rounded-xl border border-[#222] overflow-hidden">
                  {/* Card: Preview + Info side by side */}
                  <button onClick={() => setExpanded(isExpanded ? null : tmpl.name)}
                    className="w-full text-left px-5 py-4 flex items-start gap-5 hover:bg-[#151515] transition-colors border-none bg-transparent cursor-pointer">
                    {/* Mini preview */}
                    <div className="shrink-0 w-48">
                      <PreviewBlock preview={tmpl.preview} />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[#fafafa] font-semibold text-sm">{tmpl.name}</h4>
                        {tmpl.sketch !== undefined && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${tmpl.sketch ? "bg-green-500/10 text-green-400" : "bg-[#222] text-[#555]"}`}>
                            {tmpl.sketch ? "✏️ 스케치" : "✦ 클린만"}
                          </span>
                        )}
                      </div>
                      <p className="text-[#888] text-xs mb-2">{tmpl.desc}</p>
                      <p className="text-[10px] text-[#555]">{tmpl.ratios.join(" · ")}</p>
                    </div>
                    <span className="text-[#555] text-xs shrink-0 pt-1">{isExpanded ? "▲" : "▼"}</span>
                  </button>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-[#1a1a1a] pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: larger preview */}
                      <div>
                        <h5 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-2">레이아웃 미리보기</h5>
                        <PreviewBlock preview={tmpl.preview} />
                        <p className="text-xs text-[#888] mt-3">{tmpl.layout}</p>
                      </div>
                      {/* Right: schema + data */}
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-2">Props 스키마</h5>
                          <div className="bg-[#0a0a0a] rounded-lg p-3 space-y-1 border border-[#1a1a1a]">
                            {Object.entries(tmpl.propsSchema).map(([key, val]) => (
                              <div key={key} className="flex gap-2">
                                <code className="text-[11px] text-[#FF6B35] font-mono">{key}</code>
                                <span className="text-[11px] text-[#666] font-mono">{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {Object.keys(tmpl.sampleData).length > 0 && (
                          <div>
                            <h5 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-2">샘플 데이터</h5>
                            <pre className="text-[10px] text-[#888] bg-[#0a0a0a] rounded-lg p-3 overflow-x-auto font-mono leading-relaxed border border-[#1a1a1a]">
                              {JSON.stringify(tmpl.sampleData, null, 2)}
                            </pre>
                          </div>
                        )}
                        <div>
                          <h5 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-2">산출물</h5>
                          <p className="text-[10px] text-[#555] italic">media_assets 연결 시 자동 표시</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
