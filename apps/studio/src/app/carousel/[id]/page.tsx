"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SLIDE_TEMPLATES } from "@/lib/studio/slide-templates";
import type { PropSchema } from "@/lib/studio/slide-templates";
import { canvas, spacing } from "@/lib/studio/slide-tokens";
import { PropControl } from "@/components/slide-editor/PropControl";
import type { Carousel } from "@/lib/studio/carousel-store";

const FIELD_ALIASES: Record<string, string[]> = {
  title: ["title", "heading", "question", "overline", "eventName", "statLabel"],
  subtitle: ["subtitle", "subQuestion", "detail", "teaser", "caption", "reason", "guide"],
  body: ["body", "content", "quote", "tip"],
  imageUrl: ["imageUrl", "backgroundImageUrl"],
  items: ["items", "points", "steps", "nodes", "beforeItems", "afterItems"],
  steps: ["steps"],
};

function resolveProps(slide: any, slideIndex: number, totalSlides: number) {
  const tpl = SLIDE_TEMPLATES.find((t) => t.id === slide.templateId);
  if (!tpl) return {};

  const fromContent: Record<string, any> = {};
  for (const [contentKey, aliases] of Object.entries(FIELD_ALIASES)) {
    if (slide.content?.[contentKey] === undefined) continue;
    for (const alias of aliases) {
      if (alias in tpl.propsSchema) {
        fromContent[alias] = slide.content[contentKey];
        break;
      }
    }
  }

  return {
    ...tpl.defaultProps,
    ...fromContent,
    ...(slide.overrides || {}),
    slideNumber: `${slideIndex + 1}/${totalSlides}`,
  };
}

/** Reverse-map prop keys back to slide.content keys via FIELD_ALIASES */
function reverseAliasMap(propsSchema: Record<string, PropSchema>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [contentKey, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      if (alias in propsSchema) {
        map[alias] = contentKey;
      }
    }
  }
  return map;
}

const SKIP_KEYS = new Set(["slideNumber", "backgroundColor", "accentColor", "textColor", "mutedColor"]);

export default function CarouselDetailPage() {
  const params = useParams();
  const [carousel, setCarousel] = useState<Carousel | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [showIGPreview, setShowIGPreview] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [captionDraft, setCaptionDraft] = useState("");
  const [captionDirty, setCaptionDirty] = useState(false);
  const [captionSaving, setCaptionSaving] = useState(false);

  // Editor state
  const [editableProps, setEditableProps] = useState<Record<string, any>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "style">("content");
  const [lastSlideKey, setLastSlideKey] = useState("");

  useEffect(() => {
    fetch(`/api/carousels/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setCarousel(d.carousel ?? null);
        setCaptionDraft(d.carousel?.caption ?? "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const slide = carousel?.slides[selectedSlide];
  const activeTemplateId = previewTemplateId || slide?.templateId;
  const tpl = activeTemplateId ? SLIDE_TEMPLATES.find((t) => t.id === activeTemplateId) : null;
  const Comp = tpl?.component;

  // Synchronous reset — no frame delay (setState during render is safe in React 18+)
  const slideKey = `${selectedSlide}|${slide?.templateId}|${carousel?.updatedAt}`;
  if (carousel && slide && slideKey !== lastSlideKey) {
    setLastSlideKey(slideKey);
    setEditableProps(resolveProps(slide, selectedSlide, carousel.slides.length));
    setDirty(false);
    setActiveTab("content");
  }

  // Schema entries for content/style tabs
  const contentEntries = useMemo(() => {
    if (!tpl) return [];
    return Object.entries(tpl.propsSchema).filter(
      ([key, s]) => !SKIP_KEYS.has(key) && (s.group ?? "content") === "content"
    );
  }, [tpl]);

  const styleEntries = useMemo(() => {
    if (!tpl) return [];
    return Object.entries(tpl.propsSchema).filter(
      ([key, s]) => !SKIP_KEYS.has(key) && s.group === "style"
    );
  }, [tpl]);

  const hasStyleProps = styleEntries.length > 0;

  const updateProp = useCallback((key: string, value: any) => {
    setEditableProps((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const resetProps = useCallback(() => {
    if (!carousel || !slide) return;
    const resolved = resolveProps(slide, selectedSlide, carousel.slides.length);
    setEditableProps(resolved);
    setDirty(false);
  }, [carousel, slide, selectedSlide]);

  const saveProps = useCallback(async () => {
    if (!carousel || !tpl || !slide) return;
    setSaving(true);
    try {
      // Build reverse alias map
      const aliasMap = reverseAliasMap(tpl.propsSchema);

      // Separate content updates and overrides
      const newContent = { ...slide.content };
      const newOverrides = { ...(slide.overrides || {}) };

      for (const [key, schema] of Object.entries(tpl.propsSchema)) {
        if (SKIP_KEYS.has(key)) continue;
        const val = editableProps[key];
        if (val === undefined) continue;

        if (aliasMap[key]) {
          // Save to content and remove stale override
          newContent[aliasMap[key]] = val;
          delete newOverrides[key];
        } else {
          newOverrides[key] = val;
        }
      }

      const updatedSlides = carousel.slides.map((s, idx) =>
        idx === selectedSlide
          ? { ...s, content: newContent, overrides: newOverrides }
          : s
      );

      const res = await fetch(`/api/carousels/${carousel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: updatedSlides }),
      });

      if (res.ok) {
        const data = await res.json();
        setCarousel(data.carousel);
        setDirty(false);
      }
    } finally {
      setSaving(false);
    }
  }, [carousel, tpl, slide, editableProps, selectedSlide]);

  // Preview props — use editableProps for live preview
  const previewSlide = previewTemplateId
    ? { ...slide, templateId: previewTemplateId }
    : slide;
  const props = previewTemplateId
    ? previewSlide
      ? resolveProps(previewSlide, selectedSlide, carousel?.slides.length ?? 0)
      : {}
    : editableProps;

  // Same-category alternatives
  const currentCategory = slide?.category;
  const alternativeTemplates = SLIDE_TEMPLATES.filter(
    (t) => t.category === currentCategory
  );

  const applyTemplate = async (newTemplateId: string) => {
    if (!carousel) return;
    const updatedSlides = carousel.slides.map((s, idx) =>
      idx === selectedSlide ? { ...s, templateId: newTemplateId } : s
    );

    const res = await fetch(`/api/carousels/${carousel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slides: updatedSlides }),
    });

    if (res.ok) {
      const data = await res.json();
      setCarousel(data.carousel);
      setPreviewTemplateId(null);
      setShowTemplatePicker(false);
    }
  };

  if (loading) return <p className="text-[#666] p-8">로딩 중...</p>;
  if (!carousel) return <p className="text-[#666] p-8">캐러셀을 찾을 수 없습니다.</p>;

  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/carousel"
          className="text-[#555] hover:text-[#fafafa] no-underline text-sm"
        >
          ← 목록
        </Link>
        <h1 className="text-xl font-bold text-[#fafafa]">{carousel.title}</h1>
        <span className="text-xs text-[#555]">{carousel.slides.length}장</span>
      </div>

      <div className="flex gap-6">
        {/* 미리보기 */}
        <div className="flex-1 flex flex-col items-center gap-2">
          {showIGPreview ? (
            /* Instagram 피드 미리보기 */
            <div className="bg-black rounded-xl overflow-hidden" style={{ width: 468 }}>
              {/* Header */}
              <div className="flex items-center gap-2.5 px-3.5 py-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]" style={{ padding: 2 }}>
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] text-white font-bold">B</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-white leading-tight">brxce.ai</div>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="1.5" fill="#a8a8a8"/><circle cx="12" cy="12" r="1.5" fill="#a8a8a8"/><circle cx="12" cy="18" r="1.5" fill="#a8a8a8"/></svg>
              </div>

              {/* 슬라이드 이미지 */}
              <div className="relative" style={{ width: 468, height: 585 }}>
                {Comp ? (
                  <div
                    style={{
                      transform: `scale(${468 / canvas.width})`,
                      transformOrigin: "top left",
                      width: canvas.width,
                      height: canvas.height,
                    }}
                  >
                    <Comp {...props} />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#555]">
                    템플릿을 찾을 수 없습니다
                  </div>
                )}
                {/* 캐러셀 인디케이터 */}
                {carousel && carousel.slides.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                    {carousel.slides.map((_: any, idx: number) => (
                      <div key={idx} className={`rounded-full w-1.5 h-1.5 transition-colors ${idx === selectedSlide ? "bg-[#0095f6]" : "bg-white/40"}`} />
                    ))}
                  </div>
                )}
                {/* 좌우 넘기기 */}
                {selectedSlide > 0 && (
                  <button onClick={() => { setSelectedSlide(selectedSlide - 1); setPreviewTemplateId(null); setShowTemplatePicker(false); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white text-xs cursor-pointer border-none hover:bg-black/80 transition-colors">&#8249;</button>
                )}
                {carousel && selectedSlide < carousel.slides.length - 1 && (
                  <button onClick={() => { setSelectedSlide(selectedSlide + 1); setPreviewTemplateId(null); setShowTemplatePicker(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white text-xs cursor-pointer border-none hover:bg-black/80 transition-colors">&#8250;</button>
                )}
                {/* 슬라이드 번호 */}
                <div className="absolute top-3 right-3 bg-[#1a1a1a]/80 text-white text-[11px] px-2 py-0.5 rounded-full">
                  {selectedSlide + 1}/{carousel?.slides.length}
                </div>
              </div>

              {/* Action bar */}
              <div className="flex items-center px-3.5 py-2.5 gap-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fafafa" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fafafa" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fafafa" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                <div className="flex-1" />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fafafa" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </div>

              {/* Likes */}
              <div className="px-3.5 pb-1">
                <div className="text-[13px] text-white font-semibold">좋아요 128개</div>
              </div>

              {/* Caption with "더 보기" */}
              <div className="px-3.5 pb-3">
                {captionDraft ? (
                  <div className="text-[13px] text-white">
                    <span className="font-semibold">brxce.ai</span>{" "}
                    {captionExpanded ? (
                      <span className="whitespace-pre-wrap">{captionDraft}</span>
                    ) : (
                      <>
                        <span>{captionDraft.length > 80 ? captionDraft.slice(0, 80) + "..." : captionDraft}</span>
                        {captionDraft.length > 80 && (
                          <button onClick={() => setCaptionExpanded(true)} className="text-[#a8a8a8] bg-transparent border-none cursor-pointer text-[13px] ml-1">더 보기</button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <span className="text-[13px] text-[#a8a8a8] italic">캡션을 입력해주세요</span>
                )}
              </div>
            </div>
          ) : (
            /* 기본 미리보기 */
            <div
              className="relative border border-[#222] rounded-xl overflow-hidden"
              style={{ width: canvas.width * 0.5, height: canvas.height * 0.5 }}
            >
              {Comp ? (
                <div
                  style={{
                    transform: "scale(0.5)",
                    transformOrigin: "top left",
                    width: canvas.width,
                    height: canvas.height,
                  }}
                >
                  <Comp {...props} />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#555]">
                  템플릿을 찾을 수 없습니다
                </div>
              )}
              {/* Grid overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Rule of thirds */}
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-cyan-400/30" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-cyan-400/30" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-cyan-400/30" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-cyan-400/30" />
                  {/* Center cross */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-400/25" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-red-400/25" />
                  {/* Safe zone lines (safeX/safeY) — IG 4:5 crop boundary */}
                  <div className="absolute left-0 right-0 h-px bg-amber-400/50" style={{ top: `${(spacing.safeY / canvas.height) * 100}%` }} />
                  <div className="absolute left-0 right-0 h-px bg-amber-400/50" style={{ bottom: `${(spacing.safeY / canvas.height) * 100}%` }} />
                  <div className="absolute top-0 bottom-0 w-px bg-amber-400/50" style={{ left: `${(spacing.safeX / canvas.width) * 100}%` }} />
                  <div className="absolute top-0 bottom-0 w-px bg-amber-400/50" style={{ right: `${(spacing.safeX / canvas.width) * 100}%` }} />
                </div>
              )}
            </div>
          )}
          {/* 토글 버튼 */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setShowIGPreview(false)}
              className={`px-3 py-1.5 text-[11px] rounded-lg border cursor-pointer transition-colors ${
                !showIGPreview ? "bg-[#1a1a1a] border-[#444] text-[#fafafa]" : "bg-transparent border-[#333] text-[#666] hover:text-[#aaa]"
              }`}
            >원본</button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-3 py-1.5 text-[11px] rounded-lg border cursor-pointer transition-colors ${
                showGrid && !showIGPreview ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400" : "bg-transparent border-[#333] text-[#666] hover:text-[#aaa]"
              }`}
            >Grid</button>
            <button
              onClick={() => setShowIGPreview(true)}
              className={`px-3 py-1.5 text-[11px] rounded-lg border cursor-pointer transition-colors ${
                showIGPreview ? "bg-[#dd2a7b]/10 border-[#dd2a7b]/40 text-[#dd2a7b]" : "bg-transparent border-[#333] text-[#666] hover:text-[#aaa]"
              }`}
            >Instagram</button>
          </div>
        </div>

        {/* 우측 패널 — 콘텐츠 편집기 */}
        <div className="w-72 shrink-0 flex flex-col gap-4">
          {/* 편집 패널 */}
          {tpl && (
            <div className="bg-[#0f0f0f] border border-[#222] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#fafafa]">콘텐츠 수정</h3>
                {dirty && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={saveProps}
                      disabled={saving}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-[#ff6b35] text-white font-medium cursor-pointer hover:bg-[#e55a28] disabled:opacity-50 transition-colors"
                    >
                      {saving ? "저장 중..." : "저장"}
                    </button>
                    <button
                      onClick={resetProps}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-[#1a1a1a] text-[#666] border border-[#222] cursor-pointer hover:text-[#aaa] transition-colors"
                    >
                      초기화
                    </button>
                  </div>
                )}
              </div>

              {/* Tabs */}
              {hasStyleProps && (
                <div className="flex items-center gap-1 mb-3">
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      activeTab === "content"
                        ? "bg-[#1a1a1a] text-[#fafafa] font-semibold"
                        : "text-[#666] hover:text-[#aaa]"
                    }`}
                  >
                    콘텐츠
                  </button>
                  <button
                    onClick={() => setActiveTab("style")}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      activeTab === "style"
                        ? "bg-[#1a1a1a] text-[#fafafa] font-semibold"
                        : "text-[#666] hover:text-[#aaa]"
                    }`}
                  >
                    스타일
                  </button>
                </div>
              )}

              {/* Props controls */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {(activeTab === "content" ? contentEntries : styleEntries).map(([key, schema]) => (
                  <PropControl
                    key={key}
                    propKey={key}
                    schema={schema}
                    value={editableProps[key]}
                    onChange={(v) => updateProp(key, v)}
                  />
                ))}
                {activeTab === "content" && contentEntries.length === 0 && (
                  <p className="text-xs text-[#444] italic py-4 text-center">편집 가능한 콘텐츠가 없습니다</p>
                )}
                {activeTab === "style" && styleEntries.length === 0 && (
                  <p className="text-xs text-[#444] italic py-4 text-center">스타일 옵션이 없습니다</p>
                )}
              </div>
            </div>
          )}

          {/* 캡션 입력 */}
          <div className="bg-[#0f0f0f] border border-[#222] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#fafafa]">캡션</h3>
              {captionDirty && (
                <button
                  onClick={async () => {
                    setCaptionSaving(true);
                    try {
                      const res = await fetch(`/api/carousels/${carousel.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ caption: captionDraft }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setCarousel(data.carousel);
                        setCaptionDirty(false);
                      }
                    } finally {
                      setCaptionSaving(false);
                    }
                  }}
                  disabled={captionSaving}
                  className="px-2.5 py-1 text-[10px] rounded-lg bg-[#ff6b35] text-white font-medium cursor-pointer hover:bg-[#e55a28] disabled:opacity-50 transition-colors"
                >
                  {captionSaving ? "저장 중..." : "저장"}
                </button>
              )}
            </div>
            <textarea
              value={captionDraft}
              onChange={(e) => { setCaptionDraft(e.target.value); setCaptionDirty(true); }}
              placeholder="인스타그램 캡션을 입력하세요..."
              rows={4}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-xs text-[#ccc] placeholder-[#555] resize-none focus:outline-none focus:border-[#555] transition-colors"
            />
            <div className="text-[10px] text-[#555] mt-1 text-right">{captionDraft.length}자</div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-col gap-2">
            <a
              href={`/render/${carousel.id}?slide=${selectedSlide}`}
              target="_blank"
              rel="noopener"
              className="block w-full text-center px-4 py-2.5 text-xs rounded-lg bg-[#ff6b35] text-white no-underline hover:bg-[#e55a28] transition-colors font-medium"
            >
              원본 크기로 보기 ({canvas.width}×{canvas.height})
            </a>

            <button
              onClick={async () => {
                setExporting(true);
                try {
                  const res = await fetch(`/api/carousels/${carousel.id}/render?scale=2`);
                  if (!res.ok) throw new Error("Export failed");
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${carousel.title || "carousel"}.zip`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (e) {
                  console.error(e);
                  alert("내보내기에 실패했습니다.");
                } finally {
                  setExporting(false);
                }
              }}
              disabled={exporting}
              className="w-full text-center px-4 py-2.5 text-xs rounded-lg bg-[#1a1a1a] border border-[#333] text-[#aaa] hover:text-[#fafafa] hover:bg-[#222] cursor-pointer transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? "내보내는 중..." : "일괄 내보내기 (PNG 2x)"}
            </button>

            {/* 템플릿 변경 토글 */}
            <button
              onClick={() => {
                setShowTemplatePicker(!showTemplatePicker);
                if (showTemplatePicker) setPreviewTemplateId(null);
              }}
              className={`w-full text-center px-4 py-2.5 text-xs rounded-lg border cursor-pointer transition-colors font-medium ${
                showTemplatePicker
                  ? "bg-[#222] border-[#ff6b35] text-[#fafafa]"
                  : "bg-[#1a1a1a] border-[#333] text-[#aaa] hover:text-[#fafafa] hover:bg-[#222]"
              }`}
            >
              다른 템플릿 적용
            </button>
          </div>

          {/* 템플릿 선택 패널 */}
          {showTemplatePicker && (
            <div className="bg-[#0f0f0f] border border-[#222] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-[#fafafa] mb-1">
                {currentCategory} 템플릿
              </h3>
              <p className="text-[10px] text-[#555] mb-3">
                클릭하면 미리보기, 적용 버튼으로 저장
              </p>

              <div className="flex flex-col gap-1.5">
                {alternativeTemplates.map((alt) => {
                  const isCurrentOriginal = alt.id === slide?.templateId;
                  const isPreviewing = alt.id === previewTemplateId;

                  return (
                    <button
                      key={alt.id}
                      onClick={() => setPreviewTemplateId(alt.id === slide?.templateId ? null : alt.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs border cursor-pointer transition-colors ${
                        isPreviewing
                          ? "bg-[#1a1a1a] border-[#ff6b35] text-[#fafafa]"
                          : isCurrentOriginal
                          ? "bg-[#111] border-[#333] text-[#fafafa]"
                          : "bg-transparent border-[#1a1a1a] text-[#888] hover:text-[#ccc] hover:bg-[#111]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{alt.name}</span>
                        {isCurrentOriginal && (
                          <span className="text-[10px] text-[#555]">현재</span>
                        )}
                        {isPreviewing && (
                          <span className="text-[10px] text-[#ff6b35]">미리보기</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#555] mt-0.5">
                        {alt.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 적용/취소 버튼 */}
              {previewTemplateId && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => applyTemplate(previewTemplateId)}
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#ff6b35] text-white border-none cursor-pointer hover:bg-[#e55a28] transition-colors font-medium"
                  >
                    적용
                  </button>
                  <button
                    onClick={() => setPreviewTemplateId(null)}
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#1a1a1a] text-[#888] border border-[#333] cursor-pointer hover:text-[#fafafa] transition-colors"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 슬라이드 네비게이션 (썸네일) */}
      <div className="flex gap-2 flex-wrap mt-6">
        {carousel.slides.map((s, idx) => {
          const thumbTpl = SLIDE_TEMPLATES.find((t) => t.id === s.templateId);
          const ThumbComp = thumbTpl?.component;
          const thumbProps = resolveProps(s, idx, carousel.slides.length);

          return (
            <button
              key={s.id ?? idx}
              onClick={() => {
                setSelectedSlide(idx);
                setPreviewTemplateId(null);
                setShowTemplatePicker(false);
              }}
              className={`relative rounded-lg border-2 cursor-pointer transition-colors overflow-hidden ${
                idx === selectedSlide
                  ? "border-[#ff6b35]"
                  : "border-[#222] hover:border-[#444]"
              }`}
              style={{ width: 154, height: Math.round(canvas.height * (154 / canvas.width)) }}
            >
              {ThumbComp ? (
                <div
                  className="pointer-events-none"
                  style={{
                    transform: `scale(${154 / canvas.width})`,
                    transformOrigin: "top left",
                    width: canvas.width,
                    height: canvas.height,
                  }}
                >
                  <ThumbComp {...thumbProps} />
                </div>
              ) : (
                <div className="w-full h-full bg-[#111] flex items-center justify-center text-[#555] text-[10px]">
                  {idx + 1}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-[#aaa] text-center py-0.5">
                {idx + 1}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
