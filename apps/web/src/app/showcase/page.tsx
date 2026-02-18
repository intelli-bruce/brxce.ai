"use client";

import React from "react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ── Icons ── */
const ClaudeIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: size, height: size }}>
    <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
  </svg>
);

/* ── Types ── */
type Selections = Record<string, string>;

/* ── Dev Gate ── */
export default function ShowcasePage() {
  const router = useRouter();
  const [selections, setSelections] = useState<Selections>({});
  const [activeSection, setActiveSection] = useState("section-title");
  const [previewWidth, setPreviewWidth] = useState<number>(375);
  const defaultOrder = ["powered-by", "bio", "stats", "section-title", "buttons", "newsletter", "footer"];
  const [sectionOrder, setSectionOrder] = useState<string[]>(defaultOrder);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      router.replace("/");
    }
    // Load saved selections
    try {
      const saved = localStorage.getItem("showcase-selections");
      if (saved) setSelections(JSON.parse(saved));
      const savedOrder = localStorage.getItem("showcase-section-order");
      if (savedOrder) setSectionOrder(JSON.parse(savedOrder));
    } catch {}
  }, [router]);

  const select = useCallback((section: string, variant: string) => {
    setSelections((prev) => {
      const next = { ...prev, [section]: variant };
      localStorage.setItem("showcase-selections", JSON.stringify(next));
      return next;
    });
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  const sectionNav = [
    { id: "section-title", label: "섹션 타이틀" },
    { id: "powered-by", label: "Powered by" },
    { id: "bio", label: "바이오" },
    { id: "stats", label: "Stats" },
    { id: "buttons", label: "버튼/링크" },
    { id: "newsletter", label: "뉴스레터" },
    { id: "footer", label: "푸터" },
    { id: "compare", label: "🔍 비교" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa]">
      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#222] px-5 py-3">
        <div className="max-w-[900px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-lg font-bold">🦞 Showcase</h1>
            <span className="text-[11px] text-[#555] bg-[#1a1a1a] px-2 py-0.5 rounded-full">dev only</span>
            <button
              onClick={() => {
                setSelections({});
                setSectionOrder(defaultOrder);
                localStorage.removeItem("showcase-selections");
                localStorage.removeItem("showcase-section-order");
              }}
              className="ml-auto text-[11px] text-[#666] hover:text-[#999] bg-transparent border border-[#333] px-2 py-1 rounded cursor-pointer shrink-0"
            >
              선택 초기화
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sectionNav.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] border transition-all cursor-pointer ${
                  activeSection === s.id
                    ? "bg-[#fafafa] text-[#0a0a0a] border-[#fafafa] font-semibold"
                    : "bg-transparent text-[#888] border-[#333] hover:border-[#555]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-[900px] mx-auto px-5 py-10">

        {/* ═══════════════════════════════════════
            1. 섹션 타이틀
        ═══════════════════════════════════════ */}
        <SectionGroup id="section-title" title="섹션 타이틀" desc="에이전틱 워크플로우 섹션 구분선 스타일">
          {sectionTitleVariants.map((v) => (
            <Variant
              key={v.id}
              id={v.id}
              label={v.label}
              isLive={v.id === "A"}
              isSelected={selections["section-title"] === v.id}
              onSelect={() => select("section-title", v.id)}
            >
              {v.render()}
            </Variant>
          ))}
        </SectionGroup>

        {/* ═══════════════════════════════════════
            2. Powered by
        ═══════════════════════════════════════ */}
        <SectionGroup id="powered-by" title="Powered by" desc="OpenClaw × Claude 배지 스타일">
          {poweredByVariants.map((v) => (
            <Variant
              key={v.id}
              id={v.id}
              label={v.label}
              isLive={v.id === "A"}
              isSelected={selections["powered-by"] === v.id}
              onSelect={() => select("powered-by", v.id)}
            >
              {v.render()}
            </Variant>
          ))}
        </SectionGroup>

        {/* ═══════════════════════════════════════
            3. 바이오
        ═══════════════════════════════════════ */}
        <SectionGroup id="bio" title="바이오" desc="프로필 소개 텍스트">
          {bioVariants.map((v) => (
            <Variant
              key={v.id}
              id={v.id}
              label={v.label}
              isLive={v.id === "A"}
              isSelected={selections["bio"] === v.id}
              onSelect={() => select("bio", v.id)}
            >
              {v.render()}
            </Variant>
          ))}
        </SectionGroup>

        {/* ═══════════════════════════════════════
            4. Stats
        ═══════════════════════════════════════ */}
        <SectionGroup id="stats" title="Stats" desc="숫자 지표 레이아웃">
          {statsVariants.map((v) => (
            <Variant
              key={v.id}
              id={v.id}
              label={v.label}
              isLive={v.id === "A"}
              isSelected={selections["stats"] === v.id}
              onSelect={() => select("stats", v.id)}
            >
              {v.render()}
            </Variant>
          ))}
        </SectionGroup>

        {/* ═══════════════════════════════════════
            5. 버튼/링크
        ═══════════════════════════════════════ */}
        <SectionGroup id="buttons" title="버튼/링크" desc="CTA 버튼 및 링크 카드">
          {buttonVariants.map((v) => (
            <Variant
              key={v.id}
              id={v.id}
              label={v.label}
              isLive={v.id === "A"}
              isSelected={selections["buttons"] === v.id}
              onSelect={() => select("buttons", v.id)}
            >
              {v.render()}
            </Variant>
          ))}
        </SectionGroup>

        {/* ═══════════════════════════════════════
            6. 뉴스레터
        ═══════════════════════════════════════ */}
        <SectionGroup id="newsletter" title="뉴스레터" desc="구독 폼">
          {newsletterVariants.map((v) => (
            <Variant
              key={v.id}
              id={v.id}
              label={v.label}
              isLive={v.id === "A"}
              isSelected={selections["newsletter"] === v.id}
              onSelect={() => select("newsletter", v.id)}
            >
              {v.render()}
            </Variant>
          ))}
        </SectionGroup>

        {/* ═══════════════════════════════════════
            7. 푸터
        ═══════════════════════════════════════ */}
        <SectionGroup id="footer" title="푸터" desc="페이지 하단">
          {footerVariants.map((v) => (
            <Variant
              key={v.id}
              id={v.id}
              label={v.label}
              isLive={v.id === "A"}
              isSelected={selections["footer"] === v.id}
              onSelect={() => select("footer", v.id)}
            >
              {v.render()}
            </Variant>
          ))}
        </SectionGroup>

        {/* ═══════════════════════════════════════
            8. 비교 — 현재 상용 vs 선택 조합
        ═══════════════════════════════════════ */}
        <section id="compare" className="mb-20 scroll-mt-28">
          <h2 className="text-xl font-bold mb-1">🔍 비교 — 상용 vs 선택</h2>
          <p className="text-sm text-[#888] mb-4">왼쪽: 현재 배포된 버전 / 오른쪽: 위에서 선택한 조합</p>

          {/* Width selector */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[12px] text-[#888]">미리보기 너비:</span>
            {[
              { w: 375, label: "375px (iPhone SE/mini)" },
              { w: 393, label: "393px (iPhone 15)" },
              { w: 430, label: "430px (iPhone 15 Pro Max)" },
              { w: 0, label: "자동" },
            ].map((opt) => (
              <button
                key={opt.w}
                onClick={() => setPreviewWidth(opt.w)}
                className={`text-[11px] px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                  previewWidth === opt.w
                    ? "bg-[#fafafa] text-[#0a0a0a] border-[#fafafa] font-semibold"
                    : "bg-transparent text-[#888] border-[#333] hover:border-[#555]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Selection summary */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-4 mb-8">
            <div className="text-[12px] text-[#888] font-mono mb-2">선택 현황</div>
            <div className="flex flex-wrap gap-2">
              {["section-title", "powered-by", "bio", "stats", "buttons", "newsletter", "footer"].map((key) => {
                const labels: Record<string, string> = {
                  "section-title": "타이틀",
                  "powered-by": "Powered",
                  bio: "바이오",
                  stats: "Stats",
                  buttons: "버튼",
                  newsletter: "뉴스레터",
                  footer: "푸터",
                };
                const selected = selections[key];
                return (
                  <span
                    key={key}
                    className={`text-[11px] px-2 py-1 rounded-full border ${
                      selected
                        ? "border-[#ffa500] text-[#ffa500]"
                        : "border-[#333] text-[#555]"
                    }`}
                  >
                    {labels[key]}: {selected || "A (상용)"}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Side by side */}
          <div className="flex justify-center gap-4 overflow-x-auto pb-4">
            <div style={previewWidth ? { width: previewWidth, minWidth: previewWidth } : undefined} className={previewWidth ? "" : "flex-1"}>
              <div className="text-[12px] font-mono text-[#888] mb-3 text-center">
                🟢 현재 상용 {previewWidth ? `(${previewWidth}px)` : ""}
              </div>
              <FullPagePreview selections={{}} order={defaultOrder} />
            </div>
            <div style={previewWidth ? { width: previewWidth, minWidth: previewWidth } : undefined} className={previewWidth ? "" : "flex-1"}>
              <div className="text-[12px] font-mono text-[#ffa500] mb-3 text-center">
                🟡 선택 조합 {previewWidth ? `(${previewWidth}px)` : ""}
              </div>
              <FullPagePreview
                selections={selections}
                order={sectionOrder}
                draggable
                onReorder={(newOrder) => {
                  setSectionOrder(newOrder);
                  localStorage.setItem("showcase-section-order", JSON.stringify(newOrder));
                }}
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Full Page Preview Component
══════════════════════════════════════════════════ */
function FullPagePreview({
  selections,
  order,
  draggable,
  onReorder,
}: {
  selections: Selections;
  order: string[];
  draggable?: boolean;
  onReorder?: (order: string[]) => void;
}) {
  const [dragOver, setDragOver] = useState<number | null>(null);
  const dragItem = React.useRef<number | null>(null);

  const variantMap: Record<string, { label: string; render: () => React.ReactNode }> = {
    "powered-by": { label: "Powered by", render: findVariant(poweredByVariants, selections["powered-by"]).render },
    bio: { label: "바이오", render: findVariant(bioVariants, selections["bio"]).render },
    stats: { label: "Stats", render: findVariant(statsVariants, selections["stats"]).render },
    "section-title": { label: "타이틀", render: findVariant(sectionTitleVariants, selections["section-title"]).render },
    buttons: { label: "버튼", render: findVariant(buttonVariants, selections["buttons"]).render },
    newsletter: { label: "뉴스레터", render: findVariant(newsletterVariants, selections["newsletter"]).render },
    footer: { label: "푸터", render: findVariant(footerVariants, selections["footer"]).render },
  };

  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOver(idx);
  };

  const handleDrop = (idx: number) => {
    const from = dragItem.current;
    if (from === null || from === idx) { setDragOver(null); return; }
    const newOrder = [...order];
    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(idx, 0, moved);
    onReorder?.(newOrder);
    dragItem.current = null;
    setDragOver(null);
  };

  return (
    <div className="border border-[#222] rounded-2xl bg-[#0a0a0a] p-5 flex flex-col items-center gap-3 text-[0.85em]">
      {/* Profile (fixed) */}
      <div className="w-14 h-14 rounded-full border-2 border-[#333] overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
        <Image src="/profile.jpg" alt="Bruce Choe" width={56} height={56} className="w-full h-full object-cover" />
      </div>
      <div className="text-center mb-2">
        <div className="text-[16px] font-bold">Bruce Choe</div>
        <div className="text-[12px] text-[#888]">@brxce.ai</div>
      </div>

      {/* Draggable sections */}
      {order.map((key, idx) => {
        const v = variantMap[key];
        if (!v) return null;
        return (
          <div
            key={key}
            draggable={draggable}
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={() => setDragOver(null)}
            onDrop={() => handleDrop(idx)}
            className={`w-full transition-all ${draggable ? "cursor-grab active:cursor-grabbing" : ""} ${
              dragOver === idx ? "border-t-2 border-[#ffa500] pt-1" : ""
            }`}
          >
            {draggable && (
              <div className="text-[9px] text-[#555] text-center mb-1 select-none">⠿ {v.label}</div>
            )}
            {v.render()}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Variant Definitions
══════════════════════════════════════════════════ */

type VariantDef = { id: string; label: string; render: () => React.ReactNode };

function findVariant(variants: VariantDef[], selectedId?: string): VariantDef {
  return variants.find((v) => v.id === selectedId) || variants[0];
}

const statsData = [
  { num: "50+", label: "AI 프로젝트" },
  { num: "38", label: "클라이언트" },
  { num: "3", label: "자체 AI 서비스" },
];

/* ── Section Titles ── */
const sectionTitleVariants: VariantDef[] = [
  {
    id: "A",
    label: "A — 현재 상용 (13px, #888)",
    render: () => (
      <div className="flex items-center gap-3 text-[13px] font-semibold text-[#888] tracking-wide">
        <span className="flex-1 h-px bg-[#333]" />
        에이전틱 워크플로우
        <span className="flex-1 h-px bg-[#333]" />
      </div>
    ),
  },
  {
    id: "B",
    label: "B — 사이즈업 + 밝기 (15px, #ccc)",
    render: () => (
      <div className="flex items-center gap-3 text-[15px] font-bold text-[#ccc] tracking-wide">
        <span className="flex-1 h-px bg-[#333]" />
        에이전틱 워크플로우
        <span className="flex-1 h-px bg-[#333]" />
      </div>
    ),
  },
  {
    id: "C",
    label: "C — ✦ 마크 + 밝기",
    render: () => (
      <div className="flex items-center gap-3 text-[15px] font-bold text-[#ccc] tracking-wide">
        <span className="flex-1 h-px bg-[#333]" />
        ✦ 에이전틱 워크플로우
        <span className="flex-1 h-px bg-[#333]" />
      </div>
    ),
  },
  {
    id: "D",
    label: "D — 그라디언트 텍스트",
    render: () => (
      <div className="flex items-center gap-3 text-[15px] font-bold tracking-wide">
        <span className="flex-1 h-px bg-[#333]" />
        <span className="bg-gradient-to-r from-[#ff6b6b] to-[#ffa500] bg-clip-text text-transparent">
          에이전틱 워크플로우
        </span>
        <span className="flex-1 h-px bg-[#333]" />
      </div>
    ),
  },
  {
    id: "E",
    label: "E — ✦ + 그라디언트 라인",
    render: () => (
      <div className="flex items-center gap-3 text-[15px] font-bold text-[#e0e0e0] tracking-wide">
        <span className="flex-1 h-px bg-gradient-to-r from-transparent to-[#555]" />
        ✦ 에이전틱 워크플로우
        <span className="flex-1 h-px bg-gradient-to-l from-transparent to-[#555]" />
      </div>
    ),
  },
  {
    id: "F",
    label: "F — 뱃지 스타일",
    render: () => (
      <div className="flex items-center gap-3">
        <span className="flex-1 h-px bg-[#333]" />
        <span className="px-4 py-1.5 rounded-full bg-[#1a1a1a] border border-[#333] text-[13px] font-semibold text-[#ccc]">
          ✦ 에이전틱 워크플로우
        </span>
        <span className="flex-1 h-px bg-[#333]" />
      </div>
    ),
  },
  {
    id: "G",
    label: "G — 좌정렬 + 라인",
    render: () => (
      <div className="flex items-center gap-4">
        <span className="text-[15px] font-bold text-[#e0e0e0] tracking-wide shrink-0">✦ 에이전틱 워크플로우</span>
        <span className="flex-1 h-px bg-[#333]" />
      </div>
    ),
  },
];

/* ── Powered by ── */
const poweredByVariants: VariantDef[] = [
  {
    id: "A",
    label: "A — 현재 상용 (뱃지)",
    render: () => (
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-[#222] text-[12px] text-[#666]">
          <span>Powered by</span>
          <Image src="/openclaw-logo.svg" alt="OpenClaw" width={16} height={16} className="rounded" />
          <span>×</span>
          <span className="text-[#D97757]"><ClaudeIcon size={16} /></span>
        </div>
      </div>
    ),
  },
  {
    id: "B",
    label: "B — 뱃지 + 이름",
    render: () => (
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-[#222] text-[12px] text-[#666]">
          <span>Powered by</span>
          <span className="flex items-center gap-1">
            <Image src="/openclaw-logo.svg" alt="" width={14} height={14} className="rounded" />
            <span className="text-[#999]">OpenClaw</span>
          </span>
          <span>×</span>
          <span className="flex items-center gap-1">
            <span className="text-[#D97757]"><ClaudeIcon size={14} /></span>
            <span className="text-[#999]">Claude</span>
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "C",
    label: "C — 구분선 안에",
    render: () => (
      <div className="flex items-center gap-3 text-[13px] text-[#555]">
        <span className="flex-1 h-px bg-[#333]" />
        <span>Powered by</span>
        <Image src="/openclaw-logo.svg" alt="" width={16} height={16} className="rounded" />
        <span>×</span>
        <span className="text-[#D97757]"><ClaudeIcon size={16} /></span>
        <span className="flex-1 h-px bg-[#333]" />
      </div>
    ),
  },
  {
    id: "D",
    label: "D — 텍스트 온리",
    render: () => (
      <div className="text-center text-[12px] text-[#444]">
        Powered by <span className="text-[#999]">OpenClaw</span> × <span className="text-[#D97757]">Claude</span>
      </div>
    ),
  },
];

/* ── Bio ── */
const bioVariants: VariantDef[] = [
  {
    id: "A",
    label: "A — 현재 상용 (✦ 불릿)",
    render: () => (
      <div className="text-center text-sm leading-[1.7] text-[#ccc]">
        <span className="text-[#fafafa] font-medium">✦ 에이전틱 워크플로우</span>
        <br />✦ OpenClaw × ClaudeCode로 회사를 굴리는 개발자 CEO
        <br />✦ 수십 개의 AI 에이전트를 직접 빌딩하며 얻은 실전 인사이트
        <br />✦ 직접 활용해 본 결과를 공유합니다.
      </div>
    ),
  },
  {
    id: "B",
    label: "B — 한 줄 강조 + 부연",
    render: () => (
      <div className="text-center">
        <div className="text-[17px] font-bold text-[#fafafa] mb-2">에이전틱 워크플로우로 회사를 굴린다</div>
        <div className="text-sm text-[#888] leading-[1.7]">
          OpenClaw × ClaudeCode 기반, 수십 개 AI 에이전트를 직접 빌딩.<br />
          해본 것만 공유합니다.
        </div>
      </div>
    ),
  },
  {
    id: "C",
    label: "C — 카드형",
    render: () => (
      <div className="bg-[#111] border border-[#222] rounded-xl p-5 text-center">
        <div className="text-[15px] font-semibold text-[#fafafa] mb-2">✦ 에이전틱 워크플로우</div>
        <div className="text-[13px] text-[#888] leading-[1.7]">
          OpenClaw × ClaudeCode로 회사를 굴리는 개발자 CEO.
          수십 개의 AI 에이전트를 직접 빌딩하며 얻은 실전 인사이트를 공유합니다.
        </div>
      </div>
    ),
  },
  {
    id: "D",
    label: "D — 375px 최적화 (짧은 문장)",
    render: () => (
      <div className="text-center text-sm leading-[1.8] text-[#ccc]">
        <span className="text-[#fafafa] font-medium">✦ 에이전틱 워크플로우</span>
        <br />OpenClaw × ClaudeCode로
        <br />회사를 굴리는 개발자 CEO
        <br />
        <br />수십 개의 AI 에이전트를 직접 빌딩.
        <br />해본 것만 공유합니다.
      </div>
    ),
  },
  {
    id: "E",
    label: "E — 375px 최적화 (좌정렬 리스트)",
    render: () => (
      <div className="text-[13px] leading-[1.8] text-[#ccc]">
        <div className="text-center text-[#fafafa] font-medium mb-2">✦ 에이전틱 워크플로우</div>
        <div className="space-y-1">
          <div>✦ AI 에이전트로 회사를 굴리는 CEO</div>
          <div>✦ 수십 개 에이전트 직접 빌딩</div>
          <div>✦ 해본 것만 공유합니다</div>
        </div>
      </div>
    ),
  },
  {
    id: "F",
    label: "F — 375px 최적화 (2줄 압축)",
    render: () => (
      <div className="text-center text-[13px] leading-[1.7] text-[#ccc]">
        <span className="text-[15px] text-[#fafafa] font-semibold">✦ 에이전틱 워크플로우</span>
        <br />
        <span className="text-[#888]">AI 에이전트로 회사를 굴리는 개발자 CEO.</span>
        <br />
        <span className="text-[#888]">직접 빌딩한 실전 인사이트를 공유합니다.</span>
      </div>
    ),
  },
  {
    id: "G",
    label: "G — 375px 최적화 (태그 스타일)",
    render: () => (
      <div className="text-center">
        <div className="text-[15px] text-[#fafafa] font-semibold mb-3">✦ 에이전틱 워크플로우</div>
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {["AI 에이전트", "OpenClaw", "ClaudeCode", "워크플로우 자동화"].map((tag) => (
            <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-[#1a1a1a] border border-[#333] text-[#888]">
              {tag}
            </span>
          ))}
        </div>
        <div className="text-[13px] text-[#888]">해본 것만 공유합니다.</div>
      </div>
    ),
  },
];

/* ── Stats ── */
// Order variants: left / center / right for revenue placement
const statsLeft = [
  { num: "₩14,505,000", label: "에이전틱 워크플로우 순수익" },
  { num: "38", label: "클라이언트" },
  { num: "3", label: "자체 AI 서비스" },
];
const statsCenter = [
  { num: "38", label: "클라이언트" },
  { num: "₩14,505,000", label: "에이전틱 워크플로우 순수익" },
  { num: "3", label: "자체 AI 서비스" },
];
const statsRight = [
  { num: "38", label: "클라이언트" },
  { num: "3", label: "자체 AI 서비스" },
  { num: "₩14,505,000", label: "에이전틱 워크플로우 순수익" },
];

// Goal-based variants
const goalTarget = "10억";
const goalCurrent = "₩14,505,000";
const goalPercent = 1.45; // 14,505,000 / 1,000,000,000 * 100

const statsVariants: VariantDef[] = [
  {
    id: "A",
    label: "A — 현재 상용 (왼쪽, 구분선)",
    render: () => (
      <div className="flex justify-center items-center gap-6">
        {statsLeft.map((s, i) => (
          <div key={s.label} className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xl font-bold">{s.num}</div>
              <div className="text-[11px] text-[#888] mt-0.5">{s.label}</div>
            </div>
            {i < statsLeft.length - 1 && <span className="w-px h-8 bg-[#333]" />}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "B",
    label: "B — 가운데 배치 (구분선)",
    render: () => (
      <div className="flex justify-center items-center gap-6">
        {statsCenter.map((s, i) => (
          <div key={s.label} className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-xl font-bold ${s.num.startsWith("₩") ? "text-[#ffa500]" : ""}`}>{s.num}</div>
              <div className="text-[11px] text-[#888] mt-0.5">{s.label}</div>
            </div>
            {i < statsCenter.length - 1 && <span className="w-px h-8 bg-[#333]" />}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "C",
    label: "C — 오른쪽 배치 (구분선)",
    render: () => (
      <div className="flex justify-center items-center gap-6">
        {statsRight.map((s, i) => (
          <div key={s.label} className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xl font-bold">{s.num}</div>
              <div className="text-[11px] text-[#888] mt-0.5">{s.label}</div>
            </div>
            {i < statsRight.length - 1 && <span className="w-px h-8 bg-[#333]" />}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "D",
    label: "D — 수익 상단 강조 + 하단 2열",
    render: () => (
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#ffa500]">₩14,505,000</div>
          <div className="text-[11px] text-[#888] mt-0.5">에이전틱 워크플로우 순수익</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-xl font-bold">38</div>
            <div className="text-[11px] text-[#888] mt-0.5">클라이언트</div>
          </div>
          <span className="w-px h-8 bg-[#333]" />
          <div className="text-center">
            <div className="text-xl font-bold">3</div>
            <div className="text-[11px] text-[#888] mt-0.5">자체 AI 서비스</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "E",
    label: "E — 가운데 강조 (색상 + 크기)",
    render: () => (
      <div className="flex justify-center items-center gap-6">
        <div className="text-center">
          <div className="text-lg font-bold">38</div>
          <div className="text-[11px] text-[#888] mt-0.5">클라이언트</div>
        </div>
        <span className="w-px h-8 bg-[#333]" />
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-[#ff6b6b] to-[#ffa500] bg-clip-text text-transparent">₩14,505,000</div>
          <div className="text-[11px] text-[#888] mt-0.5">에이전틱 워크플로우 순수익</div>
        </div>
        <span className="w-px h-8 bg-[#333]" />
        <div className="text-center">
          <div className="text-lg font-bold">3</div>
          <div className="text-[11px] text-[#888] mt-0.5">자체 AI 서비스</div>
        </div>
      </div>
    ),
  },
  {
    id: "F",
    label: "F — 카드형 (가운데 강조)",
    render: () => (
      <div className="flex justify-center gap-3">
        <div className="text-center bg-[#111] border border-[#222] rounded-xl px-5 py-3 flex-1">
          <div className="text-xl font-bold">38</div>
          <div className="text-[11px] text-[#888] mt-0.5">클라이언트</div>
        </div>
        <div className="text-center bg-[#111] border border-[#ffa500]/30 rounded-xl px-5 py-3 flex-1">
          <div className="text-xl font-bold text-[#ffa500]">₩14,505,000</div>
          <div className="text-[11px] text-[#888] mt-0.5">에이전틱 워크플로우 순수익</div>
        </div>
        <div className="text-center bg-[#111] border border-[#222] rounded-xl px-5 py-3 flex-1">
          <div className="text-xl font-bold">3</div>
          <div className="text-[11px] text-[#888] mt-0.5">자체 AI 서비스</div>
        </div>
      </div>
    ),
  },
  {
    id: "G",
    label: "G — 🎯 목표 프로그레스 (미니멀)",
    render: () => (
      <div className="text-center">
        <div className="text-[13px] text-[#888] mb-1">에이전틱 워크플로우로 10억 만들기</div>
        <div className="text-2xl font-bold text-[#ffa500] mb-2">₩14,505,000</div>
        <div className="w-full bg-[#1a1a1a] rounded-full h-2 mb-1.5">
          <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ffa500] h-2 rounded-full transition-all" style={{ width: `${Math.max(goalPercent, 2)}%` }} />
        </div>
        <div className="text-[11px] text-[#555]">{goalPercent.toFixed(2)}% of 10억</div>
      </div>
    ),
  },
  {
    id: "H",
    label: "H — 🎯 목표 + 하단 Stats",
    render: () => (
      <div className="flex flex-col items-center gap-4">
        <div className="w-full text-center">
          <div className="text-[13px] text-[#888] mb-1">에이전틱 워크플로우로 10억 만들기</div>
          <div className="text-2xl font-bold text-[#ffa500] mb-2">₩14,505,000</div>
          <div className="w-full bg-[#1a1a1a] rounded-full h-2 mb-1.5">
            <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ffa500] h-2 rounded-full" style={{ width: `${Math.max(goalPercent, 2)}%` }} />
          </div>
          <div className="text-[11px] text-[#555]">{goalPercent.toFixed(2)}% of 10억</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-lg font-bold">38</div>
            <div className="text-[11px] text-[#888] mt-0.5">클라이언트</div>
          </div>
          <span className="w-px h-6 bg-[#333]" />
          <div className="text-center">
            <div className="text-lg font-bold">3</div>
            <div className="text-[11px] text-[#888] mt-0.5">자체 AI 서비스</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "I",
    label: "I — 🎯 카드형 프로그레스",
    render: () => (
      <div className="bg-[#111] border border-[#222] rounded-xl p-5 text-center">
        <div className="text-[12px] text-[#666] mb-0.5">🎯 목표</div>
        <div className="text-[13px] text-[#ccc] font-medium mb-3">에이전틱 워크플로우로 10억 만들기</div>
        <div className="text-[11px] text-[#888] mb-0.5">지금까지 순수익</div>
        <div className="text-3xl font-bold bg-gradient-to-r from-[#ff6b6b] to-[#ffa500] bg-clip-text text-transparent mb-3">₩14,505,000</div>
        <div className="w-full bg-[#1a1a1a] rounded-full h-2.5 mb-2">
          <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ffa500] h-2.5 rounded-full" style={{ width: `${Math.max(goalPercent, 2)}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-[#555] px-0.5">
          <span>₩0</span>
          <span>{goalPercent.toFixed(2)}%</span>
          <span>₩10억</span>
        </div>
      </div>
    ),
  },
  {
    id: "J",
    label: "J — 🎯 인라인 한 줄 + 바",
    render: () => (
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[13px] text-[#888]">에이전틱 워크플로우로 10억 만들기</span>
          <span className="text-[15px] font-bold text-[#ffa500]">₩14,505,000</span>
        </div>
        <div className="w-full bg-[#1a1a1a] rounded-full h-1.5">
          <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ffa500] h-1.5 rounded-full" style={{ width: `${Math.max(goalPercent, 2)}%` }} />
        </div>
        <div className="text-right text-[10px] text-[#555] mt-1">{goalPercent.toFixed(2)}% / 10억</div>
      </div>
    ),
  },
  {
    id: "K",
    label: "K — 🎯 큰 숫자 + 목표 텍스트만 (바 없음)",
    render: () => (
      <div className="text-center">
        <div className="text-[12px] text-[#666] mb-2">에이전틱 워크플로우로 10억 만들기</div>
        <div className="text-3xl font-bold text-[#fafafa] mb-1">₩14,505,000</div>
        <div className="text-[12px] text-[#555]">지금까지 순수익 · 목표의 {goalPercent.toFixed(2)}%</div>
      </div>
    ),
  },
];

/* ── Buttons ── */
const buttonVariants: VariantDef[] = [
  {
    id: "A",
    label: "A — 현재 상용 (다크 카드)",
    render: () => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-center gap-2.5 w-full py-4 px-5 rounded-xl bg-[#141414] border border-[#222] text-[#fafafa] text-[15px] font-medium">
          <Image src="/openclaw-logo.svg" alt="" width={22} height={22} className="rounded" />
          오픈클로 가이드북
        </div>
        <div className="flex items-center justify-center gap-2.5 w-full py-4 px-5 rounded-xl bg-[#fafafa] text-[#0a0a0a] text-[15px] font-semibold">
          <span>✉️</span>
          에이전틱 워크플로우 도입 문의
        </div>
      </div>
    ),
  },
  {
    id: "B",
    label: "B — 아웃라인 + hover fill",
    render: () => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-center gap-2.5 w-full py-4 px-5 rounded-xl border border-[#444] text-[#fafafa] text-[15px] font-medium hover:bg-[#fafafa] hover:text-[#0a0a0a] transition-all cursor-pointer">
          <Image src="/openclaw-logo.svg" alt="" width={22} height={22} className="rounded" />
          오픈클로 가이드북
        </div>
        <div className="flex items-center justify-center gap-2.5 w-full py-4 px-5 rounded-xl bg-[#fafafa] text-[#0a0a0a] text-[15px] font-semibold">
          <span>✉️</span>
          에이전틱 워크플로우 도입 문의
        </div>
      </div>
    ),
  },
  {
    id: "C",
    label: "C — 좌정렬 + 설명",
    render: () => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 w-full py-4 px-5 rounded-xl bg-[#141414] border border-[#222]">
          <Image src="/openclaw-logo.svg" alt="" width={28} height={28} className="rounded" />
          <div>
            <div className="text-[15px] font-medium text-[#fafafa]">오픈클로 가이드북</div>
            <div className="text-[12px] text-[#888]">AI 에이전트 세팅 실전 가이드</div>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full py-4 px-5 rounded-xl bg-[#141414] border border-[#222]">
          <span className="text-2xl">✉️</span>
          <div>
            <div className="text-[15px] font-medium text-[#fafafa]">도입 문의</div>
            <div className="text-[12px] text-[#888]">에이전틱 워크플로우 적용 진단</div>
          </div>
        </div>
      </div>
    ),
  },
];

/* ── Newsletter ── */
const newsletterVariants: VariantDef[] = [
  {
    id: "A",
    label: "A — 현재 상용 (인라인)",
    render: () => (
      <div className="text-center">
        <p className="text-sm text-[#888] mb-3">AI 에이전트 활용 인사이트를 이메일로 받아보세요.</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="이메일 주소를 입력하세요"
            className="flex-1 px-4 py-3 rounded-xl border border-[#333] bg-[#0a0a0a] text-[#fafafa] text-sm outline-none"
            readOnly
          />
          <button className="px-5 py-3 rounded-xl bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold shrink-0 cursor-pointer">
            구독
          </button>
        </div>
      </div>
    ),
  },
  {
    id: "B",
    label: "B — 카드형",
    render: () => (
      <div className="bg-[#111] border border-[#222] rounded-xl p-6 text-center">
        <div className="text-[15px] font-semibold mb-1">🦞 뉴스레터</div>
        <p className="text-[13px] text-[#888] mb-4">에이전틱 워크플로우 인사이트를 매주 공유합니다.</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="이메일 주소"
            className="flex-1 px-4 py-3 rounded-xl border border-[#333] bg-[#0a0a0a] text-[#fafafa] text-sm outline-none"
            readOnly
          />
          <button className="px-5 py-3 rounded-xl bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold shrink-0 cursor-pointer">
            구독
          </button>
        </div>
      </div>
    ),
  },
  {
    id: "C",
    label: "C — 풀폭 강조",
    render: () => (
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#333] rounded-xl p-6 text-center">
        <div className="text-[13px] text-[#888] mb-1">매주 화요일</div>
        <div className="text-[17px] font-bold mb-3">에이전틱 워크플로우 인사이트</div>
        <input
          type="email"
          placeholder="이메일 주소를 입력하세요"
          className="w-full px-4 py-3.5 rounded-xl border border-[#333] bg-[#0a0a0a] text-[#fafafa] text-sm outline-none mb-2"
          readOnly
        />
        <button className="w-full py-3.5 rounded-xl bg-[#fafafa] text-[#0a0a0a] text-[15px] font-semibold cursor-pointer">
          무료 구독하기
        </button>
      </div>
    ),
  },
];

/* ── Footer ── */
const footerVariants: VariantDef[] = [
  {
    id: "A",
    label: "A — 현재 상용 (한 줄)",
    render: () => (
      <div className="text-xs text-[#555] text-center">© 2026 Bruce Choe · bruce@brxce.ai</div>
    ),
  },
  {
    id: "B",
    label: "B — Powered by 통합",
    render: () => (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-[12px] text-[#444] mb-2">
          <span>Powered by</span>
          <Image src="/openclaw-logo.svg" alt="" width={14} height={14} className="rounded" />
          <span>×</span>
          <span className="text-[#D97757]"><ClaudeIcon size={14} /></span>
        </div>
        <div className="text-xs text-[#555]">© 2026 Bruce Choe · bruce@brxce.ai</div>
      </div>
    ),
  },
  {
    id: "C",
    label: "C — 링크 포함",
    render: () => (
      <div className="flex flex-col items-center gap-2 text-xs text-[#555]">
        <div className="flex gap-4">
          <span className="hover:text-[#999] cursor-pointer">블로그</span>
          <span className="hover:text-[#999] cursor-pointer">가이드</span>
          <span className="hover:text-[#999] cursor-pointer">문의</span>
        </div>
        <div>© 2026 Bruce Choe · bruce@brxce.ai</div>
      </div>
    ),
  },
];

/* ══════════════════════════════════════════════════
   Layout Components
══════════════════════════════════════════════════ */

function SectionGroup({
  id,
  title,
  desc,
  children,
}: {
  id: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-20 scroll-mt-28">
      <h2 className="text-xl font-bold mb-1">{title}</h2>
      <p className="text-sm text-[#888] mb-8">{desc}</p>
      <div className="grid gap-6">{children}</div>
    </section>
  );
}

function Variant({
  id,
  label,
  isLive,
  isSelected,
  onSelect,
  children,
}: {
  id: string;
  label: string;
  isLive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  const borderColor = isSelected
    ? "border-[#ffa500]"
    : isLive
    ? "border-[#2a5a2a]"
    : "border-[#222]";

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border-2 ${borderColor} transition-all hover:border-[#555] ${
        isSelected ? "ring-1 ring-[#ffa500]/30" : ""
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1a1a1a]">
        <span className="text-[11px] text-[#666] font-mono flex-1">{label}</span>
        {isLive && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a2e1a] text-[#4ade80] border border-[#2a5a2a]">
            상용
          </span>
        )}
        {isSelected && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2e1a00] text-[#ffa500] border border-[#5a3a00]">
            선택됨
          </span>
        )}
        {!isSelected && !isLive && (
          <span className="text-[10px] text-[#555]">클릭하여 선택</span>
        )}
      </div>
      <div className="p-8 bg-[#0d0d0d] rounded-b-[10px]">{children}</div>
    </div>
  );
}
