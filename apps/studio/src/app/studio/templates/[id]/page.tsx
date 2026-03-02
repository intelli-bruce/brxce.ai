"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import { SLIDE_TEMPLATES } from "@/lib/studio/slide-templates";
import {
  Comparison, OrgChart, BeforeAfter, FlowChart,
  OgImage, Thumbnail, Quote, SocialPost, Infographic,
  CardNewsCarousel, StepByStepCarousel, ListCarousel,
  BeforeAfterCarousel, QuoteCarousel,
} from "@brxce/diagrams";
import type {
  ComparisonProps, OrgChartProps, BeforeAfterProps, FlowChartProps,
  OgImageProps, ThumbnailProps, QuoteProps, SocialPostProps, InfographicProps,
  CardNewsCarouselProps, StepByStepCarouselProps, ListCarouselProps,
  BeforeAfterCarouselProps, QuoteCarouselProps,
} from "@brxce/diagrams";

/* ── Template metadata ── */
interface TemplateMeta {
  id: string;
  name: string;
  category: "image" | "carousel" | "video";
  sub: string;
  desc: string;
  layout: string;
  ratios: string[];
  sketch?: boolean;
  propsSchema: Record<string, string>;
  sampleData: Record<string, unknown>;
  livePreview?: string;
  slideCount?: number; // for carousels
}

/* ── Sample data ── */
const COMPARISON_SAMPLE: ComparisonProps = {
  title: "", columns: [
    { title: "수동 관리", subtitle: "기존 방식", items: ["수작업 반복", "속도 느림", "오류 빈번", "확장 불가"] },
    { title: "자동화", subtitle: "스크립트/RPA", items: ["반복 제거", "속도 향상", "규칙 기반", "유지보수 필요"] },
    { title: "에이전틱", subtitle: "AI 에이전트", items: ["자율 판단", "실시간 적응", "지속 학습", "무한 확장"], highlight: true },
  ], ratio: "guide-3:2",
};
const ORGCHART_SAMPLE: OrgChartProps = {
  title: "", top: { label: "에이전틱 워크플로우" }, hub: { label: "CEO", sub: "Bruce Choe" },
  groups: [{ label: "콘텐츠", sub: "Creator" }, { label: "마케팅", sub: "Brand" }, { label: "개발", sub: "Brxce" }, { label: "재무", sub: "Finanz" }],
  ratio: "guide-3:2",
};
const BEFOREAFTER_SAMPLE: BeforeAfterProps = {
  title: "", before: { label: "Before", items: ["매일 2시간 소요", "실수 빈번", "확장 불가", "컨텍스트 유실"] },
  after: { label: "After", items: ["10분으로 단축", "일관된 품질", "무한 확장", "메모리 지속"] }, arrow: "전환", ratio: "guide-3:2",
};
const FLOWCHART_SAMPLE: FlowChartProps = {
  title: "", nodes: [
    { id: "1", label: "아이디어", x: 0, y: 80, type: "input", highlight: true, color: "#FF6B35" },
    { id: "2", label: "기획", x: 200, y: 0 }, { id: "3", label: "제작", x: 200, y: 160 },
    { id: "4", label: "검토", x: 400, y: 80 }, { id: "5", label: "발행", x: 600, y: 80, type: "output", highlight: true, color: "#69DB7C" },
  ], edges: [
    { source: "1", target: "2", label: "분석" }, { source: "1", target: "3", label: "초안" },
    { source: "2", target: "4" }, { source: "3", target: "4" }, { source: "4", target: "5", label: "승인", animated: true },
  ], ratio: "guide-3:2",
};
const OGIMAGE_SAMPLE: OgImageProps = { title: "에이전틱 워크플로우란?", subtitle: "brxce.ai", ratio: "blog-16:9" };
const THUMBNAIL_SAMPLE: ThumbnailProps = { title: "AI 에이전트 실전 가이드", badge: "NEW", ratio: "blog-16:9" };
const QUOTE_SAMPLE: QuoteProps = { quote: "에이전틱 워크플로우는 자동화의 다음 단계다", author: "Bruce Choe", ratio: "square-1:1" };
const SOCIALPOST_SAMPLE: SocialPostProps = { text: "AI 에이전트 12개가 회사를 운영한다", cta: "brxce.ai", ratio: "square-1:1" };
const INFOGRAPHIC_SAMPLE: InfographicProps = {
  title: "2026 AI 트렌드", sections: [
    { heading: "에이전틱 워크플로우", items: ["자율 판단", "실시간 적응", "지속 학습"] },
    { heading: "멀티모달 AI", items: ["텍스트+이미지", "음성+영상", "코드 생성"] },
  ], ratio: "insta-4:5",
};
const CARDNEWS_SAMPLE: CardNewsCarouselProps = {
  cover: { title: "에이전틱 워크플로우 5단계", hook: "AI가 일하게 만드는 법" },
  slides: [{ point: "자율 판단", detail: "AI가 스스로 결정" }, { point: "실시간 적응" }, { point: "지속 학습" }],
  cta: "brxce.ai에서 더 알아보기", ratio: "insta-4:5",
};
const STEPBYSTEP_SAMPLE: StepByStepCarouselProps = {
  title: "OpenClaw 시작하기", steps: [
    { number: 1, title: "설치", desc: "npm install openclaw" },
    { number: 2, title: "설정", desc: "config 파일 생성" },
    { number: 3, title: "실행", desc: "openclaw start" },
  ], ratio: "insta-4:5",
};
const LISTCAROUSEL_SAMPLE: ListCarouselProps = {
  title: "AI 에이전트 필수 도구 5선", items: [
    { label: "OpenClaw", desc: "에이전트 오케스트레이션" },
    { label: "Claude Code", desc: "코딩 에이전트" },
    { label: "Cursor", desc: "AI IDE" },
  ], ratio: "insta-4:5",
};
const BEFOREAFTER_CAROUSEL_SAMPLE: BeforeAfterCarouselProps = {
  before: { label: "Before", items: ["매일 2시간 소요", "실수 빈번", "확장 불가"] },
  after: { label: "After", items: ["10분으로 단축", "일관된 품질", "무한 확장"] }, ratio: "insta-4:5",
};
const QUOTECAROUSEL_SAMPLE: QuoteCarouselProps = {
  quotes: [
    { text: "에이전틱 워크플로우는 자동화의 다음 단계다", author: "Bruce Choe" },
    { text: "AI는 도구가 아니라 동료다", author: "Bruce Choe" },
  ], ratio: "insta-4:5",
};

/* ── Registry ── */
const ALL_TEMPLATES: TemplateMeta[] = [
  // Diagrams
  { id: "comparison", name: "Comparison", category: "image", sub: "다이어그램", desc: "두 항목 또는 세 항목을 나란히 비교", layout: "3컬럼 · 카드(제목+부제+리스트) · 컬럼간 화살표 뱃지", ratios: ["guide 3:2", "blog 16:9", "square 1:1"], sketch: true, propsSchema: { columns: "Column[] — { title, subtitle, variant?, items[] }", highlight: "number", arrows: "Arrow[] — { label }" }, sampleData: COMPARISON_SAMPLE as unknown as Record<string, unknown>, livePreview: "comparison" },
  { id: "orgchart", name: "OrgChart", category: "image", sub: "다이어그램", desc: "중앙 허브에서 방사형으로 퍼지는 구조도", layout: "중앙 허브 카드 + 방사형 노드 + SVG 커넥터", ratios: ["guide 3:2", "wide 21:9"], sketch: true, propsSchema: { hub: "{ label, sub }", groups: "Node[] — { label, sub }", top: "{ label }" }, sampleData: ORGCHART_SAMPLE as unknown as Record<string, unknown>, livePreview: "orgchart" },
  { id: "beforeafter", name: "BeforeAfter", category: "image", sub: "다이어그램", desc: "두 상태를 큰 화살표로 연결하는 전후 비교", layout: "2패널(Before/After 카드) + LargeArrow 커넥터", ratios: ["guide 3:2", "blog 16:9"], sketch: true, propsSchema: { before: "{ label, items[] }", after: "{ label, items[] }", arrow: "string" }, sampleData: BEFOREAFTER_SAMPLE as unknown as Record<string, unknown>, livePreview: "beforeafter" },
  { id: "flowchart", name: "FlowChart", category: "image", sub: "다이어그램", desc: "노드와 엣지로 구성된 프로세스 흐름도", layout: "React Flow 기반 · 커스텀 노드 · 디자인 토큰", ratios: ["guide 3:2", "blog 16:9"], sketch: false, propsSchema: { nodes: "FlowNode[] — { id, label, x, y }", edges: "FlowEdge[] — { source, target, label? }" }, sampleData: FLOWCHART_SAMPLE as unknown as Record<string, unknown>, livePreview: "flowchart" },
  // Image
  { id: "ogimage", name: "OgImage", category: "image", sub: "커버", desc: "Open Graph 소셜 미리보기 이미지 (1200×630)", layout: "제목 + 부제 + 브랜드 로고 오버레이", ratios: ["1200×630"], propsSchema: { title: "string", subtitle: "string", tag: "string" }, sampleData: OGIMAGE_SAMPLE as unknown as Record<string, unknown>, livePreview: "ogimage" },
  { id: "thumbnail", name: "Thumbnail", category: "image", sub: "커버", desc: "YouTube/블로그 썸네일 (1280×720)", layout: "배경 이미지 + 타이틀 텍스트 + 뱃지", ratios: ["1280×720"], propsSchema: { title: "string", badge: "string" }, sampleData: THUMBNAIL_SAMPLE as unknown as Record<string, unknown>, livePreview: "thumbnail" },
  { id: "quote", name: "Quote", category: "image", sub: "소셜", desc: "인용구 카드 (1080×1080)", layout: "큰 따옴표 + 인용문 + 저자 + 브랜딩", ratios: ["1080×1080"], propsSchema: { quote: "string", author: "string" }, sampleData: QUOTE_SAMPLE as unknown as Record<string, unknown>, livePreview: "quote" },
  { id: "socialpost", name: "SocialPost", category: "image", sub: "소셜", desc: "소셜 미디어 정사각형 (1080×1080)", layout: "배경 + 메인 텍스트 + CTA", ratios: ["1080×1080"], propsSchema: { text: "string", cta: "string" }, sampleData: SOCIALPOST_SAMPLE as unknown as Record<string, unknown>, livePreview: "socialpost" },
  { id: "infographic", name: "Infographic", category: "image", sub: "인포그래픽", desc: "데이터 시각화 세로 인포그래픽", layout: "섹션별 데이터 블록 세로 배치", ratios: ["1080×1920"], propsSchema: { title: "string", sections: "Section[]" }, sampleData: INFOGRAPHIC_SAMPLE as unknown as Record<string, unknown>, livePreview: "infographic" },
  // Carousel
  { id: "cardnews", name: "CardNews", category: "carousel", sub: "카드뉴스", desc: "커버→본문→CTA 구조 캐러셀", layout: "슬라이드: 커버(제목+훅) → 본문(1포인트/장) → CTA", ratios: ["1080×1350 (4:5)"], propsSchema: { cover: "{ title, hook }", slides: "Slide[]", cta: "string" }, sampleData: CARDNEWS_SAMPLE as unknown as Record<string, unknown>, livePreview: "cardnews", slideCount: 5 },
  { id: "stepbystep", name: "StepByStep", category: "carousel", sub: "가이드", desc: "단계별 가이드 캐러셀", layout: "슬라이드: 번호 + 제목 + 설명", ratios: ["1080×1350"], propsSchema: { steps: "Step[] — { number, title, desc }" }, sampleData: STEPBYSTEP_SAMPLE as unknown as Record<string, unknown>, livePreview: "stepbystep", slideCount: 3 },
  { id: "listcarousel", name: "ListCarousel", category: "carousel", sub: "리스트", desc: "리스트형 아이템 슬라이드", layout: "슬라이드: 리스트 항목 카드", ratios: ["1080×1350"], propsSchema: { items: "ListItem[]" }, sampleData: LISTCAROUSEL_SAMPLE as unknown as Record<string, unknown>, livePreview: "listcarousel", slideCount: 3 },
  { id: "beforeaftercarousel", name: "BeforeAfterCarousel", category: "carousel", sub: "비교", desc: "전후 비교 슬라이드 페어", layout: "Before 슬라이드 → After 슬라이드", ratios: ["1080×1350"], propsSchema: { before: "Slide", after: "Slide" }, sampleData: BEFOREAFTER_CAROUSEL_SAMPLE as unknown as Record<string, unknown>, livePreview: "beforeaftercarousel", slideCount: 2 },
  { id: "quotecarousel", name: "QuoteCarousel", category: "carousel", sub: "인용", desc: "명언/인용 캐러셀", layout: "각 슬라이드에 인용문+출처", ratios: ["1080×1350"], propsSchema: { quotes: "Quote[]" }, sampleData: QUOTECAROUSEL_SAMPLE as unknown as Record<string, unknown>, livePreview: "quotecarousel", slideCount: 2 },
  // Video (no live preview)
  { id: "vsreel", name: "VSReel", category: "video", sub: "비교", desc: "VS 비교 릴스 (좌우 분할)", layout: "좌 vs 우 비교 + 점수 + 승자", ratios: ["1080×1920 (9:16)", "60fps"], propsSchema: { left: "Item", right: "Item", rounds: "Round[]" }, sampleData: {} },
  { id: "newsbreaking", name: "NewsBreaking", category: "video", sub: "뉴스", desc: "뉴스 속보 스타일", layout: "BREAKING 배너 + 슬라이딩 텍스트", ratios: ["1080×1920"], propsSchema: { headline: "string", body: "string" }, sampleData: {} },
  { id: "shortformvideo", name: "ShortFormVideo", category: "video", sub: "숏폼", desc: "숏폼 세로 영상 + 자막", layout: "배경 영상 + 자막 오버레이", ratios: ["1080×1920"], propsSchema: { captions: "Caption[]", bgVideo: "string" }, sampleData: {} },
  { id: "demo60s", name: "Demo60s", category: "video", sub: "데모", desc: "60초 데모 영상", layout: "화면 녹화 + 줌인 + 자막", ratios: ["1080×1920"], propsSchema: { screenRecording: "string", annotations: "Annotation[]" }, sampleData: {} },
  { id: "dayinthelife", name: "DayInTheLife", category: "video", sub: "브이로그", desc: "일상 브이로그 스타일", layout: "시간대별 클립 + 시계", ratios: ["1080×1920"], propsSchema: { clips: "Clip[]" }, sampleData: {} },
  { id: "textovervideo", name: "TextOverVideo", category: "video", sub: "타이포", desc: "배경 영상 위 대형 타이포그래피", layout: "배경 영상 + 텍스트 애니메이션", ratios: ["1080×1920"], propsSchema: { texts: "TextFrame[]", bgVideo: "string" }, sampleData: {} },
];

/* ── Render live preview ── */
function RenderTemplate({ id, sketch, slideIndex }: { id: string; sketch: boolean; slideIndex?: number }) {
  switch (id) {
    case "comparison": return <Comparison {...COMPARISON_SAMPLE} sketch={sketch} />;
    case "orgchart": return <OrgChart {...ORGCHART_SAMPLE} sketch={sketch} />;
    case "beforeafter": return <BeforeAfter {...BEFOREAFTER_SAMPLE} sketch={sketch} />;
    case "flowchart": return <FlowChart {...FLOWCHART_SAMPLE} />;
    case "ogimage": return <OgImage {...OGIMAGE_SAMPLE} sketch={sketch} />;
    case "thumbnail": return <Thumbnail {...THUMBNAIL_SAMPLE} sketch={sketch} />;
    case "quote": return <Quote {...QUOTE_SAMPLE} sketch={sketch} />;
    case "socialpost": return <SocialPost {...SOCIALPOST_SAMPLE} sketch={sketch} />;
    case "infographic": return <Infographic {...INFOGRAPHIC_SAMPLE} sketch={sketch} />;
    case "cardnews": return <CardNewsCarousel {...CARDNEWS_SAMPLE} sketch={sketch} slideIndex={slideIndex} />;
    case "stepbystep": return <StepByStepCarousel {...STEPBYSTEP_SAMPLE} sketch={sketch} slideIndex={slideIndex} />;
    case "listcarousel": return <ListCarousel {...LISTCAROUSEL_SAMPLE} sketch={sketch} slideIndex={slideIndex} />;
    case "beforeaftercarousel": return <BeforeAfterCarousel {...BEFOREAFTER_CAROUSEL_SAMPLE} sketch={sketch} slideIndex={slideIndex} />;
    case "quotecarousel": return <QuoteCarousel {...QUOTECAROUSEL_SAMPLE} sketch={sketch} slideIndex={slideIndex} />;
    default: return null;
  }
}

/* ── Category badge color ── */
function categoryColor(cat: string) {
  switch (cat) {
    case "image": return "bg-blue-500/10 text-blue-400";
    case "carousel": return "bg-purple-500/10 text-purple-400";
    case "video": return "bg-green-500/10 text-green-400";
    default: return "bg-[#222] text-[#888]";
  }
}
const categoryLabel: Record<string, string> = { image: "이미지", carousel: "캐러셀", video: "영상" };

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sketchMode, setSketchMode] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const tmpl = useMemo(() => ALL_TEMPLATES.find((t) => t.id === id), [id]);
  const [linkedAssets, setLinkedAssets] = useState<any[]>([]);

  useEffect(() => {
    if (!tmpl) return;
    const sb = createSupabaseBrowser();
    sb.from("media_assets")
      .select("id, file_name, url, mime_type, campaign_id, content_id, created_at")
      .ilike("file_name", `%${tmpl.id}%`)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => { if (data) setLinkedAssets(data); });
  }, [tmpl]);

  // Check if it's a slide template (cover-bold, hook-stat, etc.)
  const slideTpl = useMemo(() => SLIDE_TEMPLATES.find((t) => t.id === id), [id]);

  if (!tmpl && slideTpl) {
    return <SlideTemplateDetail tpl={slideTpl} />;
  }

  if (!tmpl) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-[#666] text-lg">템플릿을 찾을 수 없습니다</p>
        <Link href="/studio/templates" className="text-[#FF6B35] text-sm hover:underline">← 카탈로그로 돌아가기</Link>
      </div>
    );
  }

  const hasLive = !!tmpl.livePreview;
  const isCarousel = tmpl.category === "carousel";
  const totalSlides = tmpl.slideCount ?? 1;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#555]">
        <Link href="/studio/templates" className="hover:text-[#aaa] transition-colors">템플릿</Link>
        <span>/</span>
        <Link href={`/studio/templates?tab=${tmpl.category}`} className="hover:text-[#aaa] transition-colors">{categoryLabel[tmpl.category]}</Link>
        <span>/</span>
        <span className="text-[#aaa]">{tmpl.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[#fafafa]">{tmpl.name}</h1>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColor(tmpl.category)}`}>
              {categoryLabel[tmpl.category]}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#222] text-[#888]">{tmpl.sub}</span>
            {hasLive && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF6B35]/10 text-[#FF6B35]">라이브</span>}
          </div>
          <p className="text-sm text-[#888]">{tmpl.desc}</p>
        </div>
        <div className="flex gap-2">
          {tmpl.sketch !== undefined && (
            <button onClick={() => setSketchMode(!sketchMode)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition ${sketchMode ? "border-[#FF6B35] text-[#FF6B35] bg-[#FF6B35]/10" : "border-[#333] text-[#888]"}`}>
              {sketchMode ? "✏️ 스케치" : "✦ 클린"}
            </button>
          )}
        </div>
      </div>

      {/* Main preview */}
      <div className="bg-[#111] rounded-xl border border-[#222] overflow-hidden">
        {hasLive ? (
          <div className="p-6">
            <div className="max-w-3xl mx-auto">
              <RenderTemplate id={tmpl.id} sketch={sketchMode} slideIndex={isCarousel ? slideIndex : undefined} />
            </div>
            {/* Carousel slide nav */}
            {isCarousel && totalSlides > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))}
                  disabled={slideIndex === 0}
                  className="px-3 py-1 text-xs rounded border border-[#333] text-[#888] disabled:opacity-30 hover:border-[#555] transition">
                  ← 이전
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalSlides }, (_, i) => (
                    <button key={i} onClick={() => setSlideIndex(i)}
                      className={`w-2 h-2 rounded-full transition ${i === slideIndex ? "bg-[#FF6B35]" : "bg-[#333] hover:bg-[#555]"}`} />
                  ))}
                </div>
                <button onClick={() => setSlideIndex(Math.min(totalSlides - 1, slideIndex + 1))}
                  disabled={slideIndex >= totalSlides - 1}
                  className="px-3 py-1 text-xs rounded border border-[#333] text-[#888] disabled:opacity-30 hover:border-[#555] transition">
                  다음 →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-[#333] text-6xl mb-4">🎬</div>
            <p className="text-[#555] text-sm">Remotion 기반 영상 템플릿 — 라이브 프리뷰 미지원</p>
            <p className="text-[#444] text-xs mt-1">engine/ 에서 렌더링 후 미디어 라이브러리에서 확인</p>
          </div>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Layout */}
        <div className="bg-[#111] rounded-xl border border-[#222] p-5">
          <h3 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-3">레이아웃</h3>
          <p className="text-sm text-[#ccc] leading-relaxed">{tmpl.layout}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {tmpl.ratios.map((r) => (
              <span key={r} className="text-[10px] px-2 py-1 rounded bg-[#1a1a1a] text-[#888] border border-[#222]">{r}</span>
            ))}
          </div>
        </div>

        {/* Props schema */}
        <div className="bg-[#111] rounded-xl border border-[#222] p-5">
          <h3 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-3">Props 스키마</h3>
          <div className="space-y-2">
            {Object.entries(tmpl.propsSchema).map(([key, val]) => (
              <div key={key} className="flex gap-3 items-baseline">
                <code className="text-xs text-[#FF6B35] font-mono shrink-0">{key}</code>
                <span className="text-xs text-[#666] font-mono">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sample data */}
        {Object.keys(tmpl.sampleData).length > 0 && (
          <div className="bg-[#111] rounded-xl border border-[#222] p-5">
            <h3 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-3">샘플 데이터</h3>
            <pre className="text-[10px] text-[#888] bg-[#0a0a0a] rounded-lg p-3 overflow-x-auto font-mono leading-relaxed border border-[#1a1a1a] max-h-[300px] overflow-y-auto">
              {JSON.stringify(tmpl.sampleData, null, 2)}
            </pre>
          </div>
        )}

        {/* Linked outputs */}
        <div className="bg-[#111] rounded-xl border border-[#222] p-5">
          <h3 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-3">
            연결된 산출물 {linkedAssets.length > 0 && <span className="text-[#FF6B35]">({linkedAssets.length})</span>}
          </h3>
          {linkedAssets.length === 0 ? (
            <p className="text-xs text-[#444] italic">이 템플릿으로 생성된 미디어가 아직 없습니다</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {linkedAssets.map((asset) => (
                <div key={asset.id} className="rounded-lg border border-[#222] overflow-hidden bg-[#0a0a0a] group">
                  {asset.url && asset.mime_type?.startsWith("image") ? (
                    <img src={asset.url} alt={asset.file_name} className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center text-[#333] text-2xl">📄</div>
                  )}
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] text-[#888] truncate">{asset.file_name}</p>
                    <p className="text-[9px] text-[#555]">{new Date(asset.created_at).toLocaleDateString("ko-KR")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Carousel: all slides filmstrip */}
      {isCarousel && hasLive && totalSlides > 1 && (
        <div className="bg-[#111] rounded-xl border border-[#222] p-5">
          <h3 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-4">전체 슬라이드</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: totalSlides }, (_, i) => (
              <button key={i} onClick={() => setSlideIndex(i)}
                className={`shrink-0 w-40 rounded-lg overflow-hidden border-2 transition ${i === slideIndex ? "border-[#FF6B35]" : "border-transparent hover:border-[#333]"}`}>
                <div className="pointer-events-none" style={{ zoom: 0.15 }}>
                  <RenderTemplate id={tmpl.id} sketch={sketchMode} slideIndex={i} />
                </div>
                <div className="text-[10px] text-[#666] text-center py-1 bg-[#0a0a0a]">
                  {i + 1} / {totalSlides}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Slide Template Detail (cover-bold, hook-stat, body-text, cta-question 등) ── */
import type { SlideTemplateInfo } from "@/lib/studio/slide-templates";

function SlideTemplateDetail({ tpl }: { tpl: SlideTemplateInfo }) {
  const Comp = tpl.component;
  const [editableProps, setEditableProps] = useState<Record<string, any>>({ ...tpl.defaultProps });

  const categoryLabel: Record<string, string> = {
    cover: "표지", hook: "훅", body: "본문", cta: "CTA",
  };
  const categoryColor: Record<string, string> = {
    cover: "bg-orange-500/10 text-orange-400",
    hook: "bg-purple-500/10 text-purple-400",
    body: "bg-blue-500/10 text-blue-400",
    cta: "bg-green-500/10 text-green-400",
  };

  const updateProp = (key: string, value: any) => {
    setEditableProps((prev) => ({ ...prev, [key]: value }));
  };

  const resetProps = () => {
    setEditableProps({ ...tpl.defaultProps });
  };

  // Same category templates for comparison
  const sameCategory = SLIDE_TEMPLATES.filter((t) => t.category === tpl.category);

  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#555]">
        <Link href="/studio/templates?tab=carousel" className="hover:text-[#aaa] transition-colors">캐러셀 템플릿</Link>
        <span>/</span>
        <span className="text-[#aaa]">{tpl.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-[#fafafa]">{tpl.name}</h1>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColor[tpl.category] || ""}`}>
          {categoryLabel[tpl.category] || tpl.category}
        </span>
        <span className="text-sm text-[#666]">{tpl.description}</span>
      </div>

      <div className="flex gap-6">
        {/* 미리보기 */}
        <div className="shrink-0">
          <div
            className="border border-[#222] rounded-xl overflow-hidden bg-[#0a0a0a]"
            style={{ width: 432, height: 540 }}
          >
            <div
              style={{
                transform: "scale(0.4)",
                transformOrigin: "top left",
                width: 1080,
                height: 1350,
                pointerEvents: "none",
              }}
            >
              <Comp {...editableProps} slideNumber="1/1" />
            </div>
          </div>
        </div>

        {/* 에디터 패널 */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Props 에디터 */}
          <div className="bg-[#0f0f0f] border border-[#222] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#fafafa]">Props 에디터</h3>
              <button
                onClick={resetProps}
                className="text-[10px] px-2 py-1 rounded bg-[#1a1a1a] text-[#666] hover:text-[#aaa] border border-[#222] cursor-pointer transition-colors"
              >
                초기화
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(tpl.propsSchema).map(([key, schema]) => {
                if (key === "slideNumber") return null;
                const value = editableProps[key] ?? "";

                // Skip style props
                if (["backgroundColor", "accentColor", "textColor", "mutedColor"].includes(key)) return null;

                if (schema.type === "string") {
                  const isLong = typeof value === "string" && (value.length > 60 || value.includes("\n"));
                  return (
                    <div key={key}>
                      <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">
                        {schema.label}
                        {schema.required && <span className="text-[#ff6b35] ml-1">*</span>}
                      </label>
                      {isLong ? (
                        <textarea
                          value={value}
                          onChange={(e) => updateProp(key, e.target.value)}
                          rows={4}
                          className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#ccc] resize-y focus:border-[#ff6b35] focus:outline-none transition-colors"
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateProp(key, e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#ccc] focus:border-[#ff6b35] focus:outline-none transition-colors"
                        />
                      )}
                    </div>
                  );
                }

                if (schema.type === "image") {
                  return (
                    <div key={key}>
                      <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">
                        {schema.label}
                      </label>
                      <input
                        type="text"
                        value={value || ""}
                        onChange={(e) => updateProp(key, e.target.value)}
                        placeholder="이미지 URL"
                        className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#ccc] focus:border-[#ff6b35] focus:outline-none transition-colors"
                      />
                    </div>
                  );
                }

                if (schema.type === "color") {
                  return (
                    <div key={key}>
                      <label className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">
                        {schema.label}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={value || "#ff6b35"}
                          onChange={(e) => updateProp(key, e.target.value)}
                          className="w-10 h-8 rounded border border-[#222] cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={value || ""}
                          onChange={(e) => updateProp(key, e.target.value)}
                          className="flex-1 bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#ccc] font-mono focus:border-[#ff6b35] focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>

          {/* 같은 카테고리 비교 */}
          <div className="bg-[#0f0f0f] border border-[#222] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#fafafa] mb-3">
              같은 카테고리 ({categoryLabel[tpl.category]}) 비교
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {sameCategory.map((alt) => {
                const AltComp = alt.component;
                const isCurrent = alt.id === tpl.id;
                return (
                  <Link
                    key={alt.id}
                    href={`/studio/templates/${alt.id}`}
                    className={`shrink-0 rounded-lg overflow-hidden border-2 no-underline transition-colors ${
                      isCurrent ? "border-[#ff6b35]" : "border-[#222] hover:border-[#444]"
                    }`}
                  >
                    <div
                      className="bg-[#0a0a0a]"
                      style={{ width: 120, height: 150, overflow: "hidden" }}
                    >
                      <div
                        style={{
                          transform: "scale(0.111)",
                          transformOrigin: "top left",
                          width: 1080,
                          height: 1350,
                          pointerEvents: "none",
                        }}
                      >
                        <AltComp {...alt.defaultProps} slideNumber="1/1" />
                      </div>
                    </div>
                    <div className="px-2 py-1.5 bg-[#0a0a0a]">
                      <div className="text-[10px] text-[#aaa] truncate">{alt.name}</div>
                      {isCurrent && <div className="text-[9px] text-[#ff6b35]">현재</div>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
