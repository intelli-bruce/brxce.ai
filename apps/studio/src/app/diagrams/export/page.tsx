"use client";

import { useSearchParams } from "next/navigation";
import {
  Comparison,
  OrgChart,
  BeforeAfter,
  RATIO_PRESETS,
  type RatioPreset,
} from "@brxce/diagrams";

const SAMPLES: Record<string, any> = {
  comparison: {
    title: "자동화 vs AI 챗봇 vs 에이전틱 워크플로우",
    columns: [
      { title: "기존 자동화 (RPA)", items: ["IF → THEN 규칙 실행", "", "예외 상황 = 멈춤", "사람이 모든 규칙 설정", "", "학습 X", "유연성 X"] },
      { title: "AI 챗봇 (GPT 등)", items: ["질문 → 답변 (1회성)", "", "맥락 유지 X", "도구 사용 X", "", "능동적 행동 X"] },
      { title: "에이전틱 워크플로우", items: ["목표 → 계획 → 실행 → 보고", "", "스스로 판단하고 행동", "도구 연결 (MCP)", "막히면 우회 경로 탐색", "맥락 유지 + 학습", "", "사람은 방향 설정만"], highlight: true },
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
    before: { label: "Before", items: ["직접 리서치", "직접 글쓰기", "직접 코딩", "직접 이메일", "직접 데이터 정리", "", "→ 내 시간 = 100%"] },
    after: { label: "After", items: ["① 방향 설정", '   "이번 주 목표는..."', "", "② 중간 확인", '   "훅이 약해. 더 강하게."', "", "③ 최종 검수", "   팩트체크 → 승인", "", "×14 에이전트가 90% 실행", "→ 내 시간 = 10% (10배 레버리지)"] },
    arrow: "에이전틱",
  },
};

/**
 * /diagrams/export?t=comparison&ratio=guide-3:2&sketch=0
 * Renders diagram at exact export dimensions, no UI chrome.
 * Use Playwright element screenshot on #diagram-export.
 */
export default function DiagramExportPage() {
  const params = useSearchParams();
  const t = params.get("t") || "comparison";
  const ratio = (params.get("ratio") || "guide-3:2") as RatioPreset;
  const sketch = params.get("sketch") === "1";
  const preset = RATIO_PRESETS[ratio];
  const data = SAMPLES[t] || SAMPLES.comparison;

  return (
    <div style={{ width: preset.exportWidth, height: preset.exportHeight, position: "absolute", left: 0, top: 0 }}>
      {t === "comparison" && <Comparison ratio={ratio} sketch={sketch} exportMode={{ width: preset.exportWidth, height: preset.exportHeight }} {...data} />}
      {t === "orgchart" && <OrgChart ratio={ratio} sketch={sketch} exportMode={{ width: preset.exportWidth, height: preset.exportHeight }} {...data} />}
      {t === "beforeafter" && <BeforeAfter ratio={ratio} sketch={sketch} exportMode={{ width: preset.exportWidth, height: preset.exportHeight }} {...data} />}
    </div>
  );
}
