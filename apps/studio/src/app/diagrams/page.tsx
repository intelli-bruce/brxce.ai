"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Comparison,
  OrgChart,
  BeforeAfter,
  RATIO_PRESETS,
  type RatioPreset,
  exportDiagram,
} from "@brxce/diagrams";

/* ─── Sample data ─── */
const SAMPLES = {
  comparison: {
    title: "자동화 vs AI 챗봇 vs 에이전틱 워크플로우",
    columns: [
      {
        title: "기존 자동화 (RPA)",
        items: ["IF → THEN 규칙 실행", "", "예외 상황 = 멈춤", "사람이 모든 규칙 설정", "", "학습 X", "유연성 X"],
      },
      {
        title: "AI 챗봇 (GPT 등)",
        items: ["질문 → 답변 (1회성)", "", "맥락 유지 X", "도구 사용 X", "", "능동적 행동 X"],
      },
      {
        title: "에이전틱 워크플로우",
        items: [
          "목표 → 계획 → 실행 → 보고",
          "",
          "스스로 판단하고 행동",
          "도구 연결 (MCP)",
          "막히면 우회 경로 탐색",
          "맥락 유지 + 학습",
          "",
          "사람은 방향 설정만",
        ],
        highlight: true,
      },
    ],
  },
  orgchart: {
    title: "에이전트 조직도 (실제 운영 중)",
    top: { label: "CEO", sub: "사람 1명" },
    hub: { label: "총괄 에이전트", sub: "업무 배분 · 스케줄" },
    groups: [
      { label: "제품 개발 ×5", sub: "각각 다른 프로젝트", color: "#4c9aff" },
      { label: "마케팅 ×3", sub: "브랜딩 · 콘텐츠 · 퍼널", color: "#69db7c" },
      { label: "비즈니스 ×2", sub: "수주 · 재무", color: "#ffd43b" },
      { label: "지원 ×2", sub: "지식관리 · R&D", color: "#868e96" },
      { label: "기타 ×2", sub: "신규 사업", color: "#868e96" },
    ],
    footnote: "각 에이전트는 독립적으로 판단하고 실행한다. 사람(CEO)은 방향 설정과 최종 검수만 담당.",
  },
  beforeafter: {
    title: "역할의 전환: 실무자 → 경영자",
    before: {
      label: "Before",
      items: [
        "직접 리서치",
        "직접 글쓰기",
        "직접 코딩",
        "직접 이메일",
        "직접 데이터 정리",
        "",
        "→ 내 시간 = 100%",
      ],
    },
    after: {
      label: "After",
      items: [
        "① 방향 설정",
        '   "이번 주 목표는..."',
        "",
        "② 중간 확인",
        '   "훅이 약해. 더 강하게."',
        "",
        "③ 최종 검수",
        "   팩트체크 → 승인",
        "",
        "×14 에이전트가 90% 실행",
        "→ 내 시간 = 10% (10배 레버리지)",
      ],
    },
    arrow: "에이전틱",
  },
};

type TemplateKey = keyof typeof SAMPLES;

const TEMPLATE_TABS: { key: TemplateKey; icon: string; label: string }[] = [
  { key: "comparison", icon: "⊞", label: "3단 비교" },
  { key: "orgchart", icon: "◎", label: "조직도" },
  { key: "beforeafter", icon: "⇄", label: "전후 비교" },
];

const ZOOM_STEPS = [25, 50, 75, 100, 125, 150, 200];

export default function DiagramsPage() {
  const searchParams = useSearchParams();
  const initialTemplate = (searchParams.get("t") as TemplateKey) || "comparison";
  const [template, setTemplate] = useState<TemplateKey>(initialTemplate);
  const [ratio, setRatio] = useState<RatioPreset>("guide-3:2");
  const [jsonData, setJsonData] = useState(JSON.stringify(SAMPLES[template], null, 2));
  const [showEditor, setShowEditor] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [exporting, setExporting] = useState(false);
  const [sketch, setSketch] = useState(searchParams.get("sketch") === "1");

  const handleExport = useCallback(async () => {
    const el = document.getElementById("diagram-export");
    if (!el) return;
    setExporting(true);
    try {
      await exportDiagram({
        element: el,
        ratio,
        format: "png",
        pixelRatio: 2,
        filename: `diagram-${template}`,
      });
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setExporting(false);
    }
  }, [ratio, template]);

  const handleTemplateChange = useCallback((t: TemplateKey) => {
    setTemplate(t);
    setJsonData(JSON.stringify(SAMPLES[t], null, 2));
  }, []);

  const zoomIn = () => setZoom((z) => {
    const next = ZOOM_STEPS.find((s) => s > z);
    return next ?? z;
  });
  const zoomOut = () => setZoom((z) => {
    const prev = [...ZOOM_STEPS].reverse().find((s) => s < z);
    return prev ?? z;
  });

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(jsonData);
  } catch {
    /* invalid json */
  }

  const ratioInfo = RATIO_PRESETS[ratio];

  return (
    <div className="flex flex-col h-full">
      {/* ─── Top Toolbar ─── */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-[#222]">
        {/* Title */}
        <h1 className="text-base font-bold text-[#fafafa] shrink-0">📐 다이어그램</h1>

        {/* Divider */}
        <div className="w-px h-5 bg-[#333]" />

        {/* Template tabs */}
        <div className="flex gap-1 p-1 bg-[#111] rounded-lg">
          {TEMPLATE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTemplateChange(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                template === t.key
                  ? "bg-[#FF6B35] text-white shadow-sm shadow-[#FF6B35]/20"
                  : "text-[#888] hover:text-[#ccc] hover:bg-[#1a1a1a]"
              }`}
            >
              <span className="text-xs">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[#333]" />

        {/* Ratio selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#666]">비율</span>
          <select
            value={ratio}
            onChange={(e) => setRatio(e.target.value as RatioPreset)}
            className="px-3 py-1.5 rounded-lg border border-[#333] bg-[#111] text-sm text-[#fafafa] outline-none hover:border-[#555] focus:border-[#FF6B35] transition-colors cursor-pointer"
          >
            {Object.entries(RATIO_PRESETS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[#333]" />

        {/* Style toggle */}
        <div className="flex gap-1 p-1 bg-[#111] rounded-lg">
          <button
            onClick={() => setSketch(false)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              !sketch ? "bg-[#1a1a1a] text-[#fafafa]" : "text-[#888] hover:text-[#ccc]"
            }`}
          >
            ✦ 클린
          </button>
          <button
            onClick={() => setSketch(true)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              sketch ? "bg-[#1a1a1a] text-[#fafafa]" : "text-[#888] hover:text-[#ccc]"
            }`}
          >
            ✏️ 스케치
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <button
          onClick={() => setShowEditor((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            showEditor
              ? "bg-[#1a1a1a] text-[#FF6B35] border border-[#FF6B35]/30"
              : "text-[#888] hover:text-[#ccc] bg-[#111] border border-[#222] hover:border-[#444]"
          }`}
        >
          <span className="text-xs">{showEditor ? "{ }" : "{ }"}</span>
          JSON
        </button>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#888] hover:text-[#ccc] bg-[#111] border border-[#222] hover:border-[#444] transition-all disabled:opacity-50"
        >
          {exporting ? "⏳ 내보내는 중..." : "↓ PNG 내보내기"}
        </button>
      </div>

      {/* ─── Main area ─── */}
      <div className="flex flex-1 min-h-0">
        {/* JSON Editor panel (side) */}
        {showEditor && (
          <div className="w-[400px] shrink-0 border-r border-[#222] flex flex-col">
            <div className="px-3 py-2 border-b border-[#222] flex items-center justify-between">
              <span className="text-xs font-medium text-[#888]">데이터 편집</span>
              <button
                onClick={() => {
                  try {
                    setJsonData(JSON.stringify(JSON.parse(jsonData), null, 2));
                  } catch { /* skip */ }
                }}
                className="text-xs text-[#666] hover:text-[#FF6B35] transition-colors"
              >
                정렬
              </button>
            </div>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className="flex-1 p-3 bg-[#0a0a0a] text-xs text-[#ccc] font-mono outline-none resize-none"
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview canvas */}
        <div
          className="flex-1 min-h-0 overflow-auto relative"
          style={{
            backgroundImage: "radial-gradient(circle, #1a1a1a 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundColor: "#0d0d0d",
          }}
        >
          <div className="flex items-center justify-center p-8" style={{ minHeight: "100%" }}>
            <div
              style={{
                width: `${zoom}%`,
                maxWidth: zoom > 100 ? `${zoom}%` : "100%",
              }}
            >
              {template === "comparison" && (
                <Comparison ratio={ratio} sketch={sketch} {...(parsed as any)} />
              )}
              {template === "orgchart" && (
                <OrgChart ratio={ratio} sketch={sketch} {...(parsed as any)} />
              )}
              {template === "beforeafter" && (
                <BeforeAfter ratio={ratio} sketch={sketch} {...(parsed as any)} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Zoom Bar ─── */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 border-t border-[#222] bg-[#0a0a0a]">
        <button
          onClick={zoomOut}
          disabled={zoom <= 25}
          className="w-7 h-7 flex items-center justify-center rounded-md text-sm font-medium text-[#888] hover:text-[#fafafa] hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          −
        </button>

        {/* Zoom slider */}
        <input
          type="range"
          min={25}
          max={200}
          step={1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-40 h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #FF6B35 ${((zoom - 25) / 175) * 100}%, #333 ${((zoom - 25) / 175) * 100}%)`,
          }}
        />

        <button
          onClick={zoomIn}
          disabled={zoom >= 200}
          className="w-7 h-7 flex items-center justify-center rounded-md text-sm font-medium text-[#888] hover:text-[#fafafa] hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          +
        </button>

        <button
          onClick={() => setZoom(zoom === 100 ? 75 : 100)}
          className="px-2 py-0.5 rounded text-xs font-mono text-[#888] hover:text-[#fafafa] hover:bg-[#1a1a1a] transition-all min-w-[3rem] text-center"
        >
          {zoom}%
        </button>

        <div className="w-px h-4 bg-[#333]" />

        <span className="text-[10px] text-[#555]">
          {ratioInfo.width} × {ratioInfo.height}
        </span>
      </div>
    </div>
  );
}
