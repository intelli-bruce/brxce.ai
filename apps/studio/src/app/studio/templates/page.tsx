"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

/* ── Template Data ── */
interface TemplateInfo {
  name: string;
  desc: string;
  layout: string;
  ratios: string[];
  sketch?: boolean;
  propsSchema: Record<string, string>;
  sampleData: Record<string, unknown>;
}

const DIAGRAM_TEMPLATES: TemplateInfo[] = [
  {
    name: "Comparison",
    desc: "두 항목 또는 세 항목을 나란히 비교하는 3단 다이어그램",
    layout: "3컬럼 · 카드(제목+부제+리스트) · 컬럼간 화살표 뱃지",
    ratios: ["guide 3:2 (1800×1200)", "blog 16:9 (1920×1080)", "square 1:1 (1080×1080)"],
    sketch: true,
    propsSchema: {
      "columns": "Column[] — { title, subtitle, variant?, items: string[] }",
      "highlight": "number — 강조할 컬럼 인덱스 (0-based)",
      "arrows": "Arrow[] — { label } 컬럼 사이 뱃지 텍스트",
    },
    sampleData: {
      columns: [
        { title: "수동 관리", subtitle: "기존 방식", items: ["수작업 반복", "속도 느림", "오류 발생"] },
        { title: "자동화", subtitle: "스크립트", items: ["반복 제거", "속도 향상", "일부 오류"] },
        { title: "에이전틱", subtitle: "AI 에이전트", variant: "highlight", items: ["자율 판단", "실시간 적응", "지속 학습"] },
      ],
      arrows: [{ label: "진화" }, { label: "혁신" }],
    },
  },
  {
    name: "OrgChart",
    desc: "중앙 허브에서 방사형으로 퍼지는 조직/구조도",
    layout: "중앙 허브 카드 + 방사형 노드 카드 + SVG 커넥터",
    ratios: ["guide 3:2", "wide 21:9 (2520×1080)"],
    sketch: true,
    propsSchema: {
      "hub": "{ title, subtitle } — 중앙 노드",
      "nodes": "Node[] — { title, subtitle, items? } 주변 노드",
      "footnote": "string — 하단 주석",
    },
    sampleData: {
      hub: { title: "CEO", subtitle: "에이전틱 워크플로우" },
      nodes: [
        { title: "콘텐츠", subtitle: "Creator 에이전트" },
        { title: "마케팅", subtitle: "Brand 에이전트" },
        { title: "개발", subtitle: "Brxce 에이전트" },
      ],
    },
  },
  {
    name: "BeforeAfter",
    desc: "두 상태를 큰 화살표로 연결하는 전후 비교",
    layout: "2패널(Before/After 카드) + LargeArrow 커넥터",
    ratios: ["guide 3:2", "blog 16:9"],
    sketch: true,
    propsSchema: {
      "before": "{ title, subtitle, items: string[] }",
      "after": "{ title, subtitle, items: string[] }",
      "arrowLabel": "string — 화살표 위 텍스트",
    },
    sampleData: {
      before: { title: "Before", subtitle: "수동 프로세스", items: ["매일 2시간 소요", "실수 빈번", "확장 불가"] },
      after: { title: "After", subtitle: "에이전틱 자동화", items: ["10분으로 단축", "일관된 품질", "무한 확장"] },
      arrowLabel: "전환",
    },
  },
  {
    name: "FlowChart",
    desc: "노드와 엣지로 구성된 프로세스 흐름도",
    layout: "React Flow 기반 · 커스텀 노드 스타일 · 디자인 토큰 적용",
    ratios: ["guide 3:2", "blog 16:9"],
    sketch: false,
    propsSchema: {
      "nodes": "FlowNode[] — { id, data: { label }, position: { x, y } }",
      "edges": "FlowEdge[] — { id, source, target }",
    },
    sampleData: {
      nodes: [
        { id: "1", data: { label: "아이디어" }, position: { x: 0, y: 0 } },
        { id: "2", data: { label: "기획" }, position: { x: 200, y: 0 } },
        { id: "3", data: { label: "생성" }, position: { x: 400, y: 0 } },
      ],
      edges: [{ id: "e1", source: "1", target: "2" }, { id: "e2", source: "2", target: "3" }],
    },
  },
];

const IMAGE_TEMPLATES: TemplateInfo[] = [
  { name: "OgImage", desc: "Open Graph 소셜 미리보기 이미지", layout: "제목 + 부제 + 브랜드 로고 오버레이", ratios: ["1200×630"], propsSchema: { title: "string", subtitle: "string", bgColor: "string" }, sampleData: { title: "에이전틱 워크플로우란?", subtitle: "brxce.ai" } },
  { name: "Thumbnail", desc: "YouTube/블로그 썸네일", layout: "배경 이미지 + 타이틀 텍스트 + 뱃지", ratios: ["1280×720"], propsSchema: { title: "string", badge: "string", bgImage: "string" }, sampleData: { title: "AI 에이전트 실전 가이드", badge: "NEW" } },
  { name: "Quote", desc: "인용구 카드", layout: "큰 따옴표 + 인용문 + 저자", ratios: ["1080×1080"], propsSchema: { quote: "string", author: "string" }, sampleData: { quote: "에이전틱 워크플로우는 자동화의 다음 단계다", author: "Bruce Choe" } },
  { name: "SocialPost", desc: "소셜 미디어 정사각형", layout: "배경 + 메인 텍스트 + CTA", ratios: ["1080×1080"], propsSchema: { text: "string", cta: "string" }, sampleData: { text: "AI 에이전트 12개가 회사를 운영한다", cta: "brxce.ai" } },
  { name: "Infographic", desc: "데이터 시각화 인포그래픽", layout: "섹션별 데이터 블록 세로 배치", ratios: ["1080×1920"], propsSchema: { title: "string", sections: "Section[]" }, sampleData: { title: "2026 AI 트렌드", sections: ["에이전틱 워크플로우", "멀티모달 AI", "온디바이스 AI"] } },
];

const CAROUSEL_TEMPLATES: TemplateInfo[] = [
  { name: "CardNews", desc: "카드뉴스 캐러셀 (커버→본문→CTA)", layout: "슬라이드: 커버(제목+훅) → 본문(1포인트/장) → CTA", ratios: ["1080×1350 (4:5)"], propsSchema: { cover: "{ title, hook }", slides: "Slide[]", cta: "string" }, sampleData: {} },
  { name: "StepByStep", desc: "단계별 가이드", layout: "슬라이드: 번호 + 제목 + 설명", ratios: ["1080×1350"], propsSchema: { steps: "Step[]" }, sampleData: {} },
  { name: "ListCarousel", desc: "리스트형 슬라이드", layout: "슬라이드: 리스트 항목 카드", ratios: ["1080×1350"], propsSchema: { items: "ListItem[]" }, sampleData: {} },
  { name: "BeforeAfter", desc: "전후 비교 슬라이드", layout: "Before 슬라이드 → After 슬라이드", ratios: ["1080×1350"], propsSchema: { before: "Slide", after: "Slide" }, sampleData: {} },
  { name: "QuoteCarousel", desc: "명언/인용 캐러셀", layout: "각 슬라이드에 인용문+출처", ratios: ["1080×1350"], propsSchema: { quotes: "Quote[]" }, sampleData: {} },
];

const VIDEO_TEMPLATES: TemplateInfo[] = [
  { name: "VSReel", desc: "VS 비교 릴스 (좌우 분할)", layout: "좌측 vs 우측 비교 + 점수 카운터 + 승자 선언", ratios: ["1080×1920 (9:16)", "60fps"], propsSchema: { left: "Item", right: "Item", rounds: "Round[]" }, sampleData: {} },
  { name: "NewsBreaking", desc: "뉴스 속보 스타일", layout: "BREAKING 배너 + 슬라이딩 텍스트 + 브랜딩", ratios: ["1080×1920"], propsSchema: { headline: "string", body: "string" }, sampleData: {} },
  { name: "ShortFormVideo", desc: "숏폼 세로 영상", layout: "배경 영상/색상 + 자막 오버레이", ratios: ["1080×1920"], propsSchema: { captions: "Caption[]", bgVideo: "string" }, sampleData: {} },
  { name: "Demo60s", desc: "60초 데모 영상", layout: "화면 녹화 + 줌인 + 자막", ratios: ["1080×1920"], propsSchema: { screenRecording: "string", annotations: "Annotation[]" }, sampleData: {} },
  { name: "DayInTheLife", desc: "일상 브이로그 스타일", layout: "시간대별 클립 + 시계 UI + 브랜딩", ratios: ["1080×1920"], propsSchema: { clips: "Clip[]" }, sampleData: {} },
  { name: "TextOverVideo", desc: "텍스트 오버레이", layout: "배경 영상 위 대형 타이포그래피 애니메이션", ratios: ["1080×1920"], propsSchema: { texts: "TextFrame[]", bgVideo: "string" }, sampleData: {} },
];

const TABS = [
  { key: "diagram", label: "다이어그램", icon: "📐", data: DIAGRAM_TEMPLATES },
  { key: "image", label: "이미지", icon: "🖼️", data: IMAGE_TEMPLATES },
  { key: "carousel", label: "캐러셀", icon: "📱", data: CAROUSEL_TEMPLATES },
  { key: "video", label: "영상", icon: "🎬", data: VIDEO_TEMPLATES },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function TemplatesPage() {
  const searchParams = useSearchParams();
  const initial = (searchParams.get("tab") as TabKey) || "diagram";
  const [tab, setTab] = useState<TabKey>(initial);
  const [expanded, setExpanded] = useState<string | null>(null);

  const templates = TABS.find((t) => t.key === tab)?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#fafafa]">템플릿 카탈로그</h1>
        <p className="text-sm text-[#666] mt-1">각 템플릿의 구조, 레이아웃, Props 스키마, 산출물을 확인합니다</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111] p-1 rounded-lg w-fit border border-[#222]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setExpanded(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border-none cursor-pointer ${
              tab === t.key ? "bg-[#222] text-[#fafafa]" : "bg-transparent text-[#666] hover:text-[#aaa]"
            }`}
          >
            {t.icon} {t.label} <span className="text-[10px] ml-1 text-[#555]">{t.data.length}</span>
          </button>
        ))}
      </div>

      {/* Template Cards */}
      <div className="space-y-4">
        {templates.map((tmpl) => {
          const isExpanded = expanded === tmpl.name;
          return (
            <div
              key={tmpl.name}
              className="bg-[#111] rounded-xl border border-[#222] overflow-hidden"
            >
              {/* Header — always visible */}
              <button
                onClick={() => setExpanded(isExpanded ? null : tmpl.name)}
                className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-[#151515] transition-colors border-none bg-transparent cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-[#fafafa] font-semibold text-sm">{tmpl.name}</h3>
                    {tmpl.sketch !== undefined && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${tmpl.sketch ? "bg-green-500/10 text-green-400" : "bg-[#222] text-[#555]"}`}>
                        {tmpl.sketch ? "스케치 지원" : "클린만"}
                      </span>
                    )}
                  </div>
                  <p className="text-[#888] text-xs">{tmpl.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-[#555]">{tmpl.ratios.join(" · ")}</p>
                  <span className="text-[#555] text-xs">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-[#1a1a1a] pt-4 space-y-4">
                  {/* Layout */}
                  <div>
                    <h4 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1">레이아웃</h4>
                    <p className="text-xs text-[#ccc]">{tmpl.layout}</p>
                  </div>

                  {/* Supported ratios */}
                  <div>
                    <h4 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1">지원 비율</h4>
                    <div className="flex gap-2 flex-wrap">
                      {tmpl.ratios.map((r) => (
                        <span key={r} className="text-[10px] px-2 py-1 rounded bg-[#1a1a1a] text-[#aaa] border border-[#222]">{r}</span>
                      ))}
                    </div>
                  </div>

                  {/* Props Schema */}
                  <div>
                    <h4 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1">Props 스키마 (에이전트 참조)</h4>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 space-y-1">
                      {Object.entries(tmpl.propsSchema).map(([key, val]) => (
                        <div key={key} className="flex gap-2">
                          <code className="text-[11px] text-[#FF6B35] font-mono">{key}</code>
                          <span className="text-[11px] text-[#666] font-mono">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sample Data */}
                  {Object.keys(tmpl.sampleData).length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1">샘플 데이터</h4>
                      <pre className="text-[10px] text-[#888] bg-[#0a0a0a] rounded-lg p-3 overflow-x-auto font-mono leading-relaxed">
                        {JSON.stringify(tmpl.sampleData, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Produced outputs placeholder */}
                  <div>
                    <h4 className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1">이 템플릿의 산출물</h4>
                    <p className="text-[10px] text-[#555] italic">media_assets에서 연결된 산출물이 표시됩니다</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
