"use client";

import { useState } from "react";
import {
  Comparison,
  OrgChart,
  BeforeAfter,
  RATIO_PRESETS,
  type RatioPreset,
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

const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  comparison: "3단 비교",
  orgchart: "조직도",
  beforeafter: "전후 비교",
};

export default function DiagramsPage() {
  const [template, setTemplate] = useState<TemplateKey>("comparison");
  const [ratio, setRatio] = useState<RatioPreset>("guide-3:2");
  const [jsonData, setJsonData] = useState(JSON.stringify(SAMPLES[template], null, 2));
  const [showEditor, setShowEditor] = useState(true);

  function handleTemplateChange(t: TemplateKey) {
    setTemplate(t);
    setJsonData(JSON.stringify(SAMPLES[t], null, 2));
  }

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(jsonData);
  } catch {
    /* invalid json */
  }

  const preset = RATIO_PRESETS[ratio];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-xl font-bold">📐 다이어그램</h1>

        {/* Template selector */}
        <div className="flex gap-1 p-1 bg-[#111] rounded-lg">
          {(Object.keys(TEMPLATE_LABELS) as TemplateKey[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTemplateChange(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                template === t
                  ? "bg-[#FF6B35] text-white"
                  : "text-[#888] hover:text-[#fafafa]"
              }`}
            >
              {TEMPLATE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Ratio selector */}
        <select
          value={ratio}
          onChange={(e) => setRatio(e.target.value as RatioPreset)}
          className="px-3 py-1.5 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none"
        >
          {Object.entries(RATIO_PRESETS).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label} ({val.width}×{val.height})
            </option>
          ))}
        </select>

        <span className="text-xs text-[#555]">
          {preset.width}×{preset.height}
        </span>

        <button
          onClick={() => setShowEditor((v) => !v)}
          className="px-3 py-1 rounded-md text-xs font-medium text-[#888] hover:text-[#fafafa] bg-[#111] transition-colors"
        >
          {showEditor ? "에디터 접기 ◀" : "에디터 펼치기 ▶"}
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* JSON editor */}
        {showEditor && <div className="w-[360px] flex-shrink-0 flex flex-col">
          <label className="text-xs text-[#888] mb-1">데이터 (JSON)</label>
          <textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-[#333] bg-[#0a0a0a] text-xs text-[#ccc] font-mono outline-none resize-none focus:border-[#FF6B35]"
            spellCheck={false}
          />
        </div>}

        {/* Preview */}
        <div className="flex-1 overflow-auto bg-[#111] rounded-lg p-4 flex items-start justify-center" id="preview-container">
          <div
            style={{
              zoom: Math.min(1, (showEditor ? 0.55 : 0.78)),
            }}
          >
            {template === "comparison" && (
              <Comparison ratio={ratio} {...(parsed as any)} />
            )}
            {template === "orgchart" && (
              <OrgChart ratio={ratio} {...(parsed as any)} />
            )}
            {template === "beforeafter" && (
              <BeforeAfter ratio={ratio} {...(parsed as any)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
