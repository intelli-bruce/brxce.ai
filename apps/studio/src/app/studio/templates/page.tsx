"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Comparison,
  OrgChart,
  BeforeAfter,
  OgImage,
  Thumbnail,
  Quote,
  SocialPost,
  Infographic,
  CardNewsCarousel,
  StepByStepCarousel,
  ListCarousel,
  BeforeAfterCarousel,
  QuoteCarousel,
  FlowChart,
} from "@brxce/diagrams";
import type {
  ComparisonProps,
  OrgChartProps,
  BeforeAfterProps,
  FlowChartProps,
  OgImageProps,
  ThumbnailProps,
  QuoteProps,
  SocialPostProps,
  InfographicProps,
  CardNewsCarouselProps,
  StepByStepCarouselProps,
  ListCarouselProps,
  BeforeAfterCarouselProps,
  QuoteCarouselProps,
} from "@brxce/diagrams";

/* ── Types ── */
interface TemplateInfo {
  name: string;
  desc: string;
  sub: string;
  layout: string;
  ratios: string[];
  sketch?: boolean;
  propsSchema: Record<string, string>;
  sampleData: Record<string, unknown>;
  /** If set, render live React component preview */
  livePreview?: "comparison" | "orgchart" | "beforeafter" | "flowchart" | "ogimage" | "thumbnail" | "quote" | "socialpost" | "infographic" | "cardnews" | "stepbystep" | "listcarousel" | "beforeaftercarousel" | "quotecarousel";
  /** Fallback ASCII preview */
  asciiPreview?: { blocks: string[]; accent?: string };
}

/* ── Sample data for live previews ── */
const COMPARISON_SAMPLE: ComparisonProps = {
  title: "",
  columns: [
    { title: "수동 관리", subtitle: "기존 방식", items: ["수작업 반복", "속도 느림", "오류 빈번", "확장 불가"] },
    { title: "자동화", subtitle: "스크립트/RPA", items: ["반복 제거", "속도 향상", "규칙 기반", "유지보수 필요"] },
    { title: "에이전틱", subtitle: "AI 에이전트", items: ["자율 판단", "실시간 적응", "지속 학습", "무한 확장"], highlight: true },
  ],
  ratio: "guide-3:2",
};

const ORGCHART_SAMPLE: OrgChartProps = {
  title: "",
  top: { label: "에이전틱 워크플로우" },
  hub: { label: "CEO", sub: "Bruce Choe" },
  groups: [
    { label: "콘텐츠", sub: "Creator" },
    { label: "마케팅", sub: "Brand" },
    { label: "개발", sub: "Brxce" },
    { label: "재무", sub: "Finanz" },
  ],
  ratio: "guide-3:2",
};

const BEFOREAFTER_SAMPLE: BeforeAfterProps = {
  title: "",
  before: { label: "Before", items: ["매일 2시간 소요", "실수 빈번", "확장 불가", "컨텍스트 유실"] },
  after: { label: "After", items: ["10분으로 단축", "일관된 품질", "무한 확장", "메모리 지속"] },
  arrow: "전환",
  ratio: "guide-3:2",
};

/* ── FlowChart sample data ── */
const FLOWCHART_SAMPLE: FlowChartProps = {
  title: "",
  nodes: [
    { id: "1", label: "아이디어", x: 0, y: 80, type: "input", highlight: true, color: "#FF6B35" },
    { id: "2", label: "기획", x: 200, y: 0 },
    { id: "3", label: "제작", x: 200, y: 160 },
    { id: "4", label: "검토", x: 400, y: 80 },
    { id: "5", label: "발행", x: 600, y: 80, type: "output", highlight: true, color: "#69DB7C" },
  ],
  edges: [
    { source: "1", target: "2", label: "분석" },
    { source: "1", target: "3", label: "초안" },
    { source: "2", target: "4" },
    { source: "3", target: "4" },
    { source: "4", target: "5", label: "승인", animated: true },
  ],
  ratio: "guide-3:2",
};

/* ── Image template sample data ── */
const OGIMAGE_SAMPLE: OgImageProps = { title: "에이전틱 워크플로우란?", subtitle: "brxce.ai", ratio: "blog-16:9" };
const THUMBNAIL_SAMPLE: ThumbnailProps = { title: "AI 에이전트 실전 가이드", badge: "NEW", ratio: "blog-16:9" };
const QUOTE_SAMPLE: QuoteProps = { quote: "에이전틱 워크플로우는 자동화의 다음 단계다", author: "Bruce Choe", ratio: "square-1:1" };
const SOCIALPOST_SAMPLE: SocialPostProps = { text: "AI 에이전트 12개가 회사를 운영한다", cta: "brxce.ai", ratio: "square-1:1" };
const INFOGRAPHIC_SAMPLE: InfographicProps = {
  title: "2026 AI 트렌드",
  sections: [
    { heading: "에이전틱 워크플로우", items: ["자율 판단", "실시간 적응", "지속 학습"] },
    { heading: "멀티모달 AI", items: ["텍스트+이미지", "음성+영상", "코드 생성"] },
  ],
  ratio: "insta-4:5",
};

/* ── Carousel template sample data ── */
const CARDNEWS_SAMPLE: CardNewsCarouselProps = {
  cover: { title: "에이전틱 워크플로우 5단계", hook: "AI가 일하게 만드는 법" },
  slides: [{ point: "자율 판단", detail: "AI가 스스로 결정" }, { point: "실시간 적응" }, { point: "지속 학습" }],
  cta: "brxce.ai에서 더 알아보기",
  ratio: "insta-4:5",
};
const STEPBYSTEP_SAMPLE: StepByStepCarouselProps = {
  title: "OpenClaw 시작하기",
  steps: [
    { number: 1, title: "설치", desc: "npm install openclaw" },
    { number: 2, title: "설정", desc: "config 파일 생성" },
    { number: 3, title: "실행", desc: "openclaw start" },
  ],
  ratio: "insta-4:5",
};
const LISTCAROUSEL_SAMPLE: ListCarouselProps = {
  title: "AI 에이전트 필수 도구 5선",
  items: [
    { label: "OpenClaw", desc: "에이전트 오케스트레이션" },
    { label: "Claude Code", desc: "코딩 에이전트" },
    { label: "Cursor", desc: "AI IDE" },
  ],
  ratio: "insta-4:5",
};
const BEFOREAFTER_CAROUSEL_SAMPLE: BeforeAfterCarouselProps = {
  before: { label: "Before", items: ["매일 2시간 소요", "실수 빈번", "확장 불가"] },
  after: { label: "After", items: ["10분으로 단축", "일관된 품질", "무한 확장"] },
  ratio: "insta-4:5",
};
const QUOTECAROUSEL_SAMPLE: QuoteCarouselProps = {
  quotes: [
    { text: "에이전틱 워크플로우는 자동화의 다음 단계다", author: "Bruce Choe" },
    { text: "AI는 도구가 아니라 동료다", author: "Bruce Choe" },
  ],
  ratio: "insta-4:5",
};

/* ── Template Registry ── */
const IMAGE_TEMPLATES: TemplateInfo[] = [
  // Diagrams (live preview)
  {
    name: "Comparison", sub: "다이어그램", desc: "두 항목 또는 세 항목을 나란히 비교",
    layout: "3컬럼 · 카드(제목+부제+리스트) · 컬럼간 화살표 뱃지",
    ratios: ["guide 3:2", "blog 16:9", "square 1:1"], sketch: true,
    propsSchema: { columns: "Column[] — { title, subtitle, variant?, items[] }", highlight: "number", arrows: "Arrow[] — { label }" },
    sampleData: COMPARISON_SAMPLE as unknown as Record<string, unknown>,
    livePreview: "comparison",
  },
  {
    name: "OrgChart", sub: "다이어그램", desc: "중앙 허브에서 방사형으로 퍼지는 구조도",
    layout: "중앙 허브 카드 + 방사형 노드 + SVG 커넥터",
    ratios: ["guide 3:2", "wide 21:9"], sketch: true,
    propsSchema: { hub: "{ label, sub }", groups: "Node[] — { label, sub }", top: "{ label }", footnote: "string" },
    sampleData: ORGCHART_SAMPLE as unknown as Record<string, unknown>,
    livePreview: "orgchart",
  },
  {
    name: "BeforeAfter", sub: "다이어그램", desc: "두 상태를 큰 화살표로 연결하는 전후 비교",
    layout: "2패널(Before/After 카드) + LargeArrow 커넥터",
    ratios: ["guide 3:2", "blog 16:9"], sketch: true,
    propsSchema: { before: "{ label, items[] }", after: "{ label, items[] }", arrow: "string" },
    sampleData: BEFOREAFTER_SAMPLE as unknown as Record<string, unknown>,
    livePreview: "beforeafter",
  },
  {
    name: "FlowChart", sub: "다이어그램", desc: "노드와 엣지로 구성된 프로세스 흐름도",
    layout: "React Flow 기반 · 커스텀 노드 · 디자인 토큰",
    ratios: ["guide 3:2", "blog 16:9"], sketch: false,
    propsSchema: { nodes: "FlowNode[] — { id, label, x, y }", edges: "FlowEdge[] — { source, target, label? }" },
    sampleData: FLOWCHART_SAMPLE as unknown as Record<string, unknown>,
    livePreview: "flowchart",
  },
  // Cover / Thumbnail
  {
    name: "OgImage", sub: "커버", desc: "Open Graph 소셜 미리보기 이미지 (1200×630)",
    layout: "제목 + 부제 + 브랜드 로고 오버레이", ratios: ["1200×630"],
    propsSchema: { title: "string", subtitle: "string", tag: "string" },
    sampleData: OGIMAGE_SAMPLE as unknown as Record<string, unknown>,
    livePreview: "ogimage",
  },
  {
    name: "Thumbnail", sub: "커버", desc: "YouTube/블로그 썸네일 (1280×720)",
    layout: "배경 이미지 + 타이틀 텍스트 + 뱃지", ratios: ["1280×720"],
    propsSchema: { title: "string", badge: "string" },
    sampleData: THUMBNAIL_SAMPLE as unknown as Record<string, unknown>,
    livePreview: "thumbnail",
  },
  // Social
  {
    name: "Quote", sub: "소셜", desc: "인용구 카드 (1080×1080)",
    layout: "큰 따옴표 + 인용문 + 저자 + 브랜딩", ratios: ["1080×1080"],
    propsSchema: { quote: "string", author: "string" },
    sampleData: QUOTE_SAMPLE as unknown as Record<string, unknown>,
    livePreview: "quote",
  },
  {
    name: "SocialPost", sub: "소셜", desc: "소셜 미디어 정사각형 (1080×1080)",
    layout: "배경 + 메인 텍스트 + CTA", ratios: ["1080×1080"],
    propsSchema: { text: "string", cta: "string" },
    sampleData: SOCIALPOST_SAMPLE as unknown as Record<string, unknown>,
    livePreview: "socialpost",
  },
  {
    name: "Infographic", sub: "인포그래픽", desc: "데이터 시각화 세로 인포그래픽",
    layout: "섹션별 데이터 블록 세로 배치", ratios: ["1080×1920"],
    propsSchema: { title: "string", sections: "Section[]" },
    sampleData: INFOGRAPHIC_SAMPLE as unknown as Record<string, unknown>,
    livePreview: "infographic",
  },
];

const CAROUSEL_TEMPLATES: TemplateInfo[] = [
  { name: "CardNews", sub: "카드뉴스", desc: "커버→본문→CTA 구조 캐러셀", layout: "슬라이드: 커버(제목+훅) → 본문(1포인트/장) → CTA", ratios: ["1080×1350 (4:5)"], propsSchema: { cover: "{ title, hook }", slides: "Slide[]", cta: "string" },
    sampleData: CARDNEWS_SAMPLE as unknown as Record<string, unknown>, livePreview: "cardnews" },
  { name: "StepByStep", sub: "가이드", desc: "단계별 가이드 캐러셀", layout: "슬라이드: 번호 + 제목 + 설명", ratios: ["1080×1350"], propsSchema: { steps: "Step[] — { number, title, desc }" },
    sampleData: STEPBYSTEP_SAMPLE as unknown as Record<string, unknown>, livePreview: "stepbystep" },
  { name: "ListCarousel", sub: "리스트", desc: "리스트형 아이템 슬라이드", layout: "슬라이드: 리스트 항목 카드", ratios: ["1080×1350"], propsSchema: { items: "ListItem[]" },
    sampleData: LISTCAROUSEL_SAMPLE as unknown as Record<string, unknown>, livePreview: "listcarousel" },
  { name: "BeforeAfterCarousel", sub: "비교", desc: "전후 비교 슬라이드 페어", layout: "Before 슬라이드 → After 슬라이드", ratios: ["1080×1350"], propsSchema: { before: "Slide", after: "Slide" },
    sampleData: BEFOREAFTER_CAROUSEL_SAMPLE as unknown as Record<string, unknown>, livePreview: "beforeaftercarousel" },
  { name: "QuoteCarousel", sub: "인용", desc: "명언/인용 캐러셀", layout: "각 슬라이드에 인용문+출처", ratios: ["1080×1350"], propsSchema: { quotes: "Quote[]" },
    sampleData: QUOTECAROUSEL_SAMPLE as unknown as Record<string, unknown>, livePreview: "quotecarousel" },
];

const VIDEO_TEMPLATES: TemplateInfo[] = [
  { name: "VSReel", sub: "비교", desc: "VS 비교 릴스 (좌우 분할)", layout: "좌 vs 우 비교 + 점수 + 승자", ratios: ["1080×1920 (9:16)", "60fps"], propsSchema: { left: "Item", right: "Item", rounds: "Round[]" }, sampleData: {},
    asciiPreview: { blocks: ["┌────┬────┐", "│ VS │ VS │", "│ L  │ R  │", "│ 3  │ 5  │", "│   WINNER│", "└────┴────┘"], accent: "#FF6B35" } },
  { name: "NewsBreaking", sub: "뉴스", desc: "뉴스 속보 스타일", layout: "BREAKING 배너 + 슬라이딩 텍스트", ratios: ["1080×1920"], propsSchema: { headline: "string", body: "string" }, sampleData: {},
    asciiPreview: { blocks: ["┌──────────┐", "│ BREAKING │", "│══════════│", "│ headline │", "│  body... │", "└──────────┘"], accent: "#FF922B" } },
  { name: "ShortFormVideo", sub: "숏폼", desc: "숏폼 세로 영상 + 자막", layout: "배경 영상 + 자막 오버레이", ratios: ["1080×1920"], propsSchema: { captions: "Caption[]", bgVideo: "string" }, sampleData: {},
    asciiPreview: { blocks: ["┌──────────┐", "│  [video] │", "│ ───────  │", "│ caption  │", "└──────────┘"], accent: "#66D9E8" } },
  { name: "Demo60s", sub: "데모", desc: "60초 데모 영상", layout: "화면 녹화 + 줌인 + 자막", ratios: ["1080×1920"], propsSchema: { screenRecording: "string", annotations: "Annotation[]" }, sampleData: {},
    asciiPreview: { blocks: ["┌──────────┐", "│ ┌──────┐ │", "│ │screen│ │", "│ └──────┘ │", "│ 🔍 zoom  │", "└──────────┘"], accent: "#B197FC" } },
  { name: "DayInTheLife", sub: "브이로그", desc: "일상 브이로그 스타일", layout: "시간대별 클립 + 시계", ratios: ["1080×1920"], propsSchema: { clips: "Clip[]" }, sampleData: {},
    asciiPreview: { blocks: ["┌──────────┐", "│  09:00   │", "│  [clip1] │", "│  12:00   │", "│  [clip2] │", "└──────────┘"], accent: "#69DB7C" } },
  { name: "TextOverVideo", sub: "타이포", desc: "배경 영상 위 대형 타이포그래피", layout: "배경 영상 + 텍스트 애니메이션", ratios: ["1080×1920"], propsSchema: { texts: "TextFrame[]", bgVideo: "string" }, sampleData: {},
    asciiPreview: { blocks: ["┌──────────┐", "│  BIG     │", "│  TEXT    │", "│ [video]  │", "└──────────┘"], accent: "#FFD43B" } },
];

const TABS = [
  { key: "image", label: "이미지", icon: "🖼️", data: IMAGE_TEMPLATES },
  { key: "carousel", label: "캐러셀", icon: "📱", data: CAROUSEL_TEMPLATES },
  { key: "video", label: "영상", icon: "🎬", data: VIDEO_TEMPLATES },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function groupBySub(templates: TemplateInfo[]): Map<string, TemplateInfo[]> {
  const map = new Map<string, TemplateInfo[]>();
  for (const t of templates) {
    if (!map.has(t.sub)) map.set(t.sub, []);
    map.get(t.sub)!.push(t);
  }
  return map;
}

/* ── Live Diagram Preview ── */
function LivePreview({ type, sketch }: { type: string; sketch: boolean }) {
  const wrapStyle = { width: "100%", maxHeight: 280, overflow: "hidden" as const, borderRadius: 8 };

  switch (type) {
    case "comparison":
      return (
        <div style={wrapStyle}>
          <Comparison {...COMPARISON_SAMPLE} sketch={sketch} />
        </div>
      );
    case "orgchart":
      return (
        <div style={wrapStyle}>
          <OrgChart {...ORGCHART_SAMPLE} sketch={sketch} />
        </div>
      );
    case "beforeafter":
      return (
        <div style={wrapStyle}>
          <BeforeAfter {...BEFOREAFTER_SAMPLE} sketch={sketch} />
        </div>
      );
    case "flowchart":
      return <div style={wrapStyle}><FlowChart {...FLOWCHART_SAMPLE} /></div>;
    case "ogimage":
      return <div style={wrapStyle}><OgImage {...OGIMAGE_SAMPLE} sketch={sketch} /></div>;
    case "thumbnail":
      return <div style={wrapStyle}><Thumbnail {...THUMBNAIL_SAMPLE} sketch={sketch} /></div>;
    case "quote":
      return <div style={wrapStyle}><Quote {...QUOTE_SAMPLE} sketch={sketch} /></div>;
    case "socialpost":
      return <div style={wrapStyle}><SocialPost {...SOCIALPOST_SAMPLE} sketch={sketch} /></div>;
    case "infographic":
      return <div style={wrapStyle}><Infographic {...INFOGRAPHIC_SAMPLE} sketch={sketch} /></div>;
    case "cardnews":
      return <div style={wrapStyle}><CardNewsCarousel {...CARDNEWS_SAMPLE} sketch={sketch} /></div>;
    case "stepbystep":
      return <div style={wrapStyle}><StepByStepCarousel {...STEPBYSTEP_SAMPLE} sketch={sketch} /></div>;
    case "listcarousel":
      return <div style={wrapStyle}><ListCarousel {...LISTCAROUSEL_SAMPLE} sketch={sketch} /></div>;
    case "beforeaftercarousel":
      return <div style={wrapStyle}><BeforeAfterCarousel {...BEFOREAFTER_CAROUSEL_SAMPLE} sketch={sketch} /></div>;
    case "quotecarousel":
      return <div style={wrapStyle}><QuoteCarousel {...QUOTECAROUSEL_SAMPLE} sketch={sketch} /></div>;
    default:
      return null;
  }
}

/* ── ASCII Fallback Preview ── */
function AsciiPreview({ blocks, accent }: { blocks: string[]; accent?: string }) {
  return (
    <div className="bg-[#0a0a0a] rounded-lg p-4 font-mono text-[11px] leading-relaxed overflow-x-auto border border-[#1a1a1a]"
      style={{ color: accent || "#555" }}>
      {blocks.map((line, i) => <div key={i} className="whitespace-pre">{line}</div>)}
    </div>
  );
}

/* ── Template Preview Wrapper ── */
function TemplatePreview({ tmpl, large, sketch }: { tmpl: TemplateInfo; large?: boolean; sketch?: boolean }) {
  if (tmpl.livePreview) {
    return <LivePreview type={tmpl.livePreview} sketch={sketch ?? false} />;
  }
  if (tmpl.asciiPreview) {
    return <AsciiPreview {...tmpl.asciiPreview} />;
  }
  return <div className="bg-[#0a0a0a] rounded-lg p-8 text-center text-[#333] text-sm border border-[#1a1a1a]">미리보기 없음</div>;
}

export default function TemplatesPage() {
  const searchParams = useSearchParams();
  const initial = (searchParams.get("tab") as TabKey) || "image";
  const [tab, setTab] = useState<TabKey>(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sketchMode, setSketchMode] = useState(false);

  const templates = TABS.find((t) => t.key === tab)?.data ?? [];
  const groups = groupBySub(templates);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#fafafa]">템플릿 카탈로그</h1>
          <p className="text-sm text-[#666] mt-1">각 템플릿의 실제 렌더, 구조, Props를 확인합니다</p>
        </div>
        {/* Sketch toggle for diagram previews */}
        {tab === "image" && (
          <button
            onClick={() => setSketchMode(!sketchMode)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition ${
              sketchMode ? "border-[#FF6B35] text-[#FF6B35] bg-[#FF6B35]/10" : "border-[#333] text-[#888] bg-transparent"
            }`}
          >
            {sketchMode ? "✏️ 스케치" : "✦ 클린"}
          </button>
        )}
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

      {/* Template cards grouped by sub-category */}
      {Array.from(groups.entries()).map(([subLabel, items]) => (
        <div key={subLabel}>
          <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">{subLabel}</h3>
          <div className="space-y-3 mb-8">
            {items.map((tmpl) => {
              const isExpanded = expanded === tmpl.name;
              return (
                <div key={tmpl.name} className="bg-[#111] rounded-xl border border-[#222] overflow-hidden">
                  {/* Collapsed: preview + info */}
                  <button onClick={() => setExpanded(isExpanded ? null : tmpl.name)}
                    className="w-full text-left px-5 py-4 flex items-start gap-5 hover:bg-[#151515] transition-colors border-none bg-transparent cursor-pointer">
                    <div className="shrink-0 w-56">
                      <TemplatePreview tmpl={tmpl} sketch={sketchMode} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[#fafafa] font-semibold text-sm">{tmpl.name}</h4>
                        {tmpl.livePreview && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF6B35]/10 text-[#FF6B35]">라이브</span>
                        )}
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

                  {/* Expanded: larger preview + details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-[#1a1a1a] pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-2">렌더 미리보기</h5>
                        <TemplatePreview tmpl={tmpl} large sketch={sketchMode} />
                        <p className="text-xs text-[#888] mt-3">{tmpl.layout}</p>
                      </div>
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
                            <pre className="text-[10px] text-[#888] bg-[#0a0a0a] rounded-lg p-3 overflow-x-auto font-mono leading-relaxed border border-[#1a1a1a] max-h-[200px]">
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
