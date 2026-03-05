"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SLIDE_TEMPLATES, type SlideTemplateInfo } from "@/lib/studio/slide-templates";
import { canvas } from "@/lib/studio/slide-tokens";

/* ─── types ─── */
type Category = "cover" | "hook" | "body" | "cta";

/** 공통 콘텐츠 풀 — 템플릿 간 공유 가능한 필드 */
type SlideContent = {
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  items?: string[];
  [key: string]: any;
};

type CarouselSlide = {
  id: string;
  templateId: string;
  label: string;
  category: Category;
  /** 공통 콘텐츠 (템플릿 교체해도 유지) */
  content: SlideContent;
  /** 템플릿 전용 필드 오버라이드 (개별 수정) */
  overrides: Record<string, any>;
};

/**
 * 공통 content 필드명 → 각 템플릿 prop명 매핑.
 * 매핑 안 되는 필드는 무시 (개별 편집으로 해결).
 */
const FIELD_ALIASES: Record<string, string[]> = {
  title: ["title", "heading", "question", "overline", "eventName", "statLabel"],
  subtitle: ["subtitle", "subQuestion", "detail", "teaser", "caption", "reason", "guide"],
  body: ["body", "content", "quote", "tip"],
  imageUrl: ["imageUrl", "backgroundImageUrl"],
  items: ["items", "points", "steps", "nodes"],
};

/** content → template props 변환. 매핑되는 것만 넣고 나머진 건너뜀 */
function contentToTemplateProps(content: SlideContent, schema: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [contentKey, aliases] of Object.entries(FIELD_ALIASES)) {
    if (content[contentKey] === undefined) continue;
    for (const alias of aliases) {
      if (alias in schema) {
        result[alias] = content[contentKey];
        break;
      }
    }
  }
  return result;
}

/** template props → content로 역변환 (편집 내용을 content에 반영) */
function templatePropsToContent(props: Record<string, any>, schema: Record<string, any>): SlideContent {
  const content: SlideContent = {};
  for (const [contentKey, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      if (alias in props && props[alias] !== undefined) {
        content[contentKey] = props[alias];
        break;
      }
    }
  }
  return content;
}

/** 슬라이드의 최종 렌더 props 계산: defaultProps ← content 매핑 ← overrides */
function resolveSlideProps(slide: CarouselSlide): Record<string, any> {
  const tpl = SLIDE_TEMPLATES.find((t) => t.id === slide.templateId);
  if (!tpl) return {};
  const fromContent = contentToTemplateProps(slide.content, tpl.propsSchema);
  return { ...tpl.defaultProps, ...fromContent, ...slide.overrides };
}

type Carousel = {
  id: string;
  title: string;
  slides: CarouselSlide[];
  updatedAt: string;
};

/* ─── constants ─── */
const STORAGE_KEY = "studio-template-carousels-v2";

const CATEGORIES: { key: Category; label: string; desc: string; tagClass: string }[] = [
  { key: "cover", label: "커버", desc: "첫 슬라이드. 2초 안에 스크롤 멈추기", tagClass: "bg-[#ff6b35]/15 text-[#ff6b35]" },
  { key: "hook", label: "Slide 2 · 훅", desc: "신뢰 + 로드맵. 계속 볼 이유를 만드는 슬라이드", tagClass: "bg-[#64c8ff]/12 text-[#64c8ff]" },
  { key: "body", label: "본문", desc: "슬라이드당 포인트 1개. 시각적 리듬 유지", tagClass: "bg-[#a78bfa]/12 text-[#a78bfa]" },
  { key: "cta", label: "CTA", desc: "행동 유도. 저장/공유/팔로우/DM/링크 중 1가지에 집중", tagClass: "bg-[#4ade80]/12 text-[#4ade80]" },
];

const templatesByCategory = CATEGORIES.map((cat) => ({
  ...cat,
  templates: SLIDE_TEMPLATES.filter((t) => t.category === cat.key),
}));

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", { hour12: false });
}

/* ─── Template card in showcase grid (draggable) ─── */
function TemplateCard({ template }: { template: SlideTemplateInfo }) {
  const dragId = `tpl:${template.id}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId,
    data: { kind: "template", template },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  /* Render mini preview via the actual component */
  const Comp = template.component;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="min-w-[216px] max-w-[216px] cursor-grab rounded-[14px] border-2 border-white/[0.06] bg-[#0d0d0d] overflow-hidden hover:border-[#ff6b35]/40 transition-all hover:-translate-y-[3px] group"
    >
      {/* preview scaled down */}
      <div className="overflow-hidden relative" style={{ width: Math.round(canvas.width * 0.2), height: Math.round(canvas.height * 0.2) }}>
        <div className="origin-top-left scale-[0.2] pointer-events-none" style={{ width: canvas.width, height: canvas.height }}>
          <Comp {...template.defaultProps} />
        </div>
      </div>
      <div
        className="px-4 py-3 border-t border-white/[0.06] cursor-pointer hover:bg-white/5 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          const ta = document.createElement("textarea"); ta.value = template.id; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
          const el = e.currentTarget;
          const orig = el.querySelector('.tpl-name')?.textContent;
          const nameEl = el.querySelector('.tpl-name');
          if (nameEl) {
            nameEl.textContent = '✓ Copied!';
            setTimeout(() => { if (nameEl) nameEl.textContent = orig || template.name; }, 1200);
          }
        }}
      >
        <p className="tpl-name text-sm font-bold text-[#eee]">{template.name}</p>
        <p className="text-[11px] text-white/30 mt-0.5">{template.id}</p>
      </div>
    </div>
  );
}

/* ─── Slide in BottomSheet carousel (sortable + droppable) ─── */
function CarouselSlideCard({
  slide,
  carouselId,
  onRemove,
  onSelect,
  isSelected,
}: {
  slide: CarouselSlide;
  carouselId: string;
  onRemove: () => void;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const sortableId = `slide:${carouselId}:${slide.id}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
    data: { kind: "slide", carouselId, slideId: slide.id },
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `slot:${carouselId}:${slide.id}`,
    data: { kind: "slot", carouselId, slideId: slide.id },
  });

  const tpl = SLIDE_TEMPLATES.find((t) => t.id === slide.templateId);
  const Comp = tpl?.component;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={(node) => { setNodeRef(node); setDropRef(node); }}
      style={style}
      onClick={onSelect}
      className={`min-w-[142px] max-w-[142px] rounded-xl border overflow-hidden relative group cursor-pointer ${
        isSelected ? "border-[#ff6b35] ring-1 ring-[#ff6b35]/30" : isOver ? "border-[#ff6b35] border-dashed" : "border-[#2a2a2a]"
      } bg-[#111]`}
    >
      <button
        {...attributes}
        {...listeners}
        className="absolute top-1.5 left-1.5 text-[#666] text-xs z-20 cursor-grab"
        aria-label="이동"
      >
        ⠿
      </button>
      <button
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 z-30 hidden group-hover:flex items-center justify-center w-5 h-5 rounded bg-black/60 text-[#ddd] text-[10px]"
        aria-label="삭제"
      >
        ✕
      </button>
      <div className="h-[178px] overflow-hidden relative bg-[#0d0d0d]">
        {Comp ? (
          <div className="origin-top-left scale-[0.1315] pointer-events-none" style={{ width: canvas.width, height: canvas.height }}>
            <Comp {...resolveSlideProps(slide)} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-[#444] text-[11px]">
            <span className="text-xl mb-1">🖼️</span>
          </div>
        )}
      </div>
      <div className="px-2 py-1.5 border-t border-[#222]">
        <span className="text-[10px] text-[#aaa] truncate block">{slide.label}</span>
      </div>
    </div>
  );
}

/* ─── Append drop zone ─── */
function AppendDropZone({ carouselId }: { carouselId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `append:${carouselId}`,
    data: { kind: "append", carouselId },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[142px] h-[210px] rounded-xl border border-dashed flex flex-col items-center justify-center text-xs shrink-0 ${
        isOver
          ? "border-[#ff6b35] bg-[#ff6b35]/10 text-[#ff6b35]"
          : "border-[#333] bg-[#0f0f0f] text-[#555]"
      }`}
    >
      <span className="text-xl mb-1">＋</span>
      드롭하여 추가
    </div>
  );
}

/* ─── BottomSheet ─── */
function BottomSheet({
  open,
  onToggle,
  children,
  carouselCount,
}: {
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  carouselCount: number;
}) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        open ? "translate-y-0" : "translate-y-[calc(100%-56px)]"
      }`}
    >
      {/* Handle bar */}
      <button
        onClick={onToggle}
        className="w-full h-14 bg-[#151515] border-t border-[#2a2a2a] flex items-center justify-between px-6 cursor-pointer hover:bg-[#1a1a1a] transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-1 rounded-full bg-[#444]" />
          <span className="text-sm font-semibold text-[#eee]">내 캐러셀</span>
          <span className="text-xs text-[#666]">{carouselCount}개</span>
        </div>
        <span className="text-[#666] text-lg">{open ? "▾" : "▴"}</span>
      </button>
      {/* Content */}
      <div className="bg-[#111] border-t border-[#222] max-h-[50vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function TemplatesPage() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const [carousels, setCarousels] = useState<Carousel[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Carousel[];
    } catch {
      return [];
    }
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<SlideTemplateInfo | null>(null);
  const [selectedSlide, setSelectedSlide] = useState<{ carouselId: string; slideId: string } | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carousels));
  }, [carousels]);

  /* --- carousel CRUD --- */
  function createCarousel() {
    const next: Carousel = {
      id: uid("carousel"),
      title: `새 캐러셀 ${carousels.length + 1}`,
      slides: [],
      updatedAt: new Date().toISOString(),
    };
    setCarousels((prev) => [next, ...prev]);
    setSheetOpen(true);
  }

  function deleteCarousel(id: string) {
    setCarousels((prev) => prev.filter((c) => c.id !== id));
  }

  function removeSlide(carouselId: string, slideId: string) {
    setCarousels((prev) =>
      prev.map((c) =>
        c.id === carouselId
          ? { ...c, slides: c.slides.filter((s) => s.id !== slideId), updatedAt: new Date().toISOString() }
          : c
      )
    );
  }

  function appendSlide(carouselId: string, template: SlideTemplateInfo) {
    const slide: CarouselSlide = {
      id: uid("slide"),
      templateId: template.id,
      label: template.name,
      category: template.category,
      content: templatePropsToContent(template.defaultProps, template.propsSchema),
      overrides: {},
    };
    setCarousels((prev) =>
      prev.map((c) =>
        c.id === carouselId
          ? { ...c, slides: [...c.slides, slide], updatedAt: new Date().toISOString() }
          : c
      )
    );
  }

  function replaceSlot(carouselId: string, slideId: string, template: SlideTemplateInfo) {
    setCarousels((prev) =>
      prev.map((c) => {
        if (c.id !== carouselId) return c;
        return {
          ...c,
          slides: c.slides.map((s) =>
            s.id === slideId
              ? {
                  ...s,
                  templateId: template.id,
                  label: template.name,
                  category: template.category,
                  // content 유지 → 매핑 가능한 필드는 자동 반영, overrides 리셋
                  overrides: {},
                }
              : s
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }

  /** 특정 슬라이드의 overrides를 부분 업데이트 + content에도 역반영 */
  function updateSlideField(carouselId: string, slideId: string, propKey: string, value: any) {
    setCarousels((prev) =>
      prev.map((c) => {
        if (c.id !== carouselId) return c;
        return {
          ...c,
          slides: c.slides.map((s) => {
            if (s.id !== slideId) return s;
            const newOverrides = { ...s.overrides, [propKey]: value };
            // 역매핑: override가 content 공통 필드에 해당하면 content도 업데이트
            const newContent = { ...s.content };
            for (const [contentKey, aliases] of Object.entries(FIELD_ALIASES)) {
              if (aliases.includes(propKey)) {
                newContent[contentKey] = value;
                break;
              }
            }
            return { ...s, overrides: newOverrides, content: newContent };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }

  /* --- DnD handlers --- */
  function onDragStart(event: DragStartEvent) {
    const data = event.active.data.current as any;
    if (data?.kind === "template") setActiveTemplate(data.template);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTemplate(null);
    if (!over) return;

    const activeData = active.data.current as any;
    const overData = over.data.current as any;
    if (!activeData || !overData) return;

    // Template → append/slot
    if (activeData.kind === "template" && activeData.template) {
      const tpl = activeData.template as SlideTemplateInfo;
      if (overData.kind === "append" && overData.carouselId) {
        appendSlide(overData.carouselId, tpl);
        if (!sheetOpen) setSheetOpen(true);
        return;
      }
      if (overData.kind === "slot" && overData.carouselId && overData.slideId) {
        replaceSlot(overData.carouselId, overData.slideId, tpl);
        return;
      }
    }

    // Slide reorder
    if (activeData.kind === "slide" && overData.kind === "slide") {
      const cId = activeData.carouselId;
      if (cId !== overData.carouselId) return;
      setCarousels((prev) =>
        prev.map((c) => {
          if (c.id !== cId) return c;
          const oldIdx = c.slides.findIndex((s) => s.id === activeData.slideId);
          const newIdx = c.slides.findIndex((s) => s.id === overData.slideId);
          if (oldIdx < 0 || newIdx < 0) return c;
          return { ...c, slides: arrayMove(c.slides, oldIdx, newIdx), updatedAt: new Date().toISOString() };
        })
      );
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="pb-[280px]">
        {/* Header */}
        <div className="px-12 pt-10 pb-8 border-b border-white/[0.06]">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-[28px] font-black text-[#fafafa]">캐러셀 레이아웃 패턴</h1>
              <p className="text-sm text-white/40 mt-2 leading-relaxed">
                템플릿을 드래그해서 아래 BottomSheet의 캐러셀에 드롭하세요
              </p>
            </div>
            <button
              onClick={createCarousel}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#ff6b35] text-white hover:bg-[#ff5522] transition"
            >
              + 새 캐러셀
            </button>
          </div>
        </div>

        {/* Category grids — showcase style */}
        {templatesByCategory.map((cat, idx) => (
          <div key={cat.key}>
            {idx > 0 && <div className="h-px bg-white/[0.04] mx-12" />}
            <section className="px-12 py-8">
              <div className="flex items-center gap-3 mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${cat.tagClass}`}>
                  {cat.label}
                </span>
                <span className="text-xs text-white/25">{cat.templates.length}개</span>
              </div>
              <p className="text-[13px] text-white/35 mb-6">{cat.desc}</p>
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
                {cat.templates.map((tpl) => (
                  <TemplateCard key={tpl.id} template={tpl} />
                ))}
              </div>
            </section>
          </div>
        ))}
      </div>

      {/* BottomSheet — carousel workspace */}
      <BottomSheet open={sheetOpen} onToggle={() => setSheetOpen(!sheetOpen)} carouselCount={carousels.length}>
        <div className="p-5 space-y-5">
          {carousels.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#333] bg-[#0f0f0f] p-10 text-center">
              <p className="text-[#777] text-sm">캐러셀이 없습니다. "새 캐러셀" 버튼으로 시작하세요.</p>
            </div>
          ) : (
            carousels.map((carousel) => (
              <div key={carousel.id} className="bg-[#0d0d0d] border border-[#222] rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <input
                      value={carousel.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setCarousels((prev) =>
                          prev.map((c) =>
                            c.id === carousel.id ? { ...c, title, updatedAt: new Date().toISOString() } : c
                          )
                        );
                      }}
                      className="bg-transparent text-[#fafafa] font-semibold outline-none border-none p-0 text-base"
                    />
                    <p className="text-[11px] text-[#666] mt-1">
                      {carousel.slides.length}장 · {formatTime(carousel.updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs rounded-lg bg-[#1b1b1b] border border-[#2b2b2b] text-[#aaa] hover:text-white transition">
                      미리보기
                    </button>
                    <button className="px-3 py-1.5 text-xs rounded-lg bg-[#ff6b35] text-white hover:bg-[#ff5522] transition">
                      렌더
                    </button>
                    <button
                      onClick={() => deleteCarousel(carousel.id)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-[#1b1b1b] border border-[#442020] text-[#d17f7f] hover:text-[#ff6666] transition"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto pb-1">
                  <SortableContext
                    items={carousel.slides.map((s) => `slide:${carousel.id}:${s.id}`)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="flex gap-3">
                      {carousel.slides.map((slide) => (
                        <CarouselSlideCard
                          key={slide.id}
                          slide={slide}
                          carouselId={carousel.id}
                          onRemove={() => removeSlide(carousel.id, slide.id)}
                          isSelected={selectedSlide?.carouselId === carousel.id && selectedSlide?.slideId === slide.id}
                          onSelect={() =>
                            setSelectedSlide(
                              selectedSlide?.slideId === slide.id ? null : { carouselId: carousel.id, slideId: slide.id }
                            )
                          }
                        />
                      ))}
                      <AppendDropZone carouselId={carousel.id} />
                    </div>
                  </SortableContext>
                </div>
              </div>
            ))
          )}
          {/* Props editor for selected slide */}
          {selectedSlide && (() => {
            const car = carousels.find((c) => c.id === selectedSlide.carouselId);
            const sl = car?.slides.find((s) => s.id === selectedSlide.slideId);
            const tpl = sl ? SLIDE_TEMPLATES.find((t) => t.id === sl.templateId) : null;
            if (!sl || !tpl) return null;
            const Comp = tpl.component;
            return (
              <div className="border-t border-[#2a2a2a] p-5">
                <div className="flex gap-6">
                  {/* Live preview */}
                  <div className="shrink-0 rounded-xl overflow-hidden border border-[#2a2a2a]" style={{ width: Math.round(canvas.width * 0.2), height: Math.round(canvas.height * 0.2) }}>
                    <div className="origin-top-left scale-[0.2] pointer-events-none" style={{ width: canvas.width, height: canvas.height }}>
                      <Comp {...resolveSlideProps(sl)} />
                    </div>
                  </div>
                  {/* Props form */}
                  <div className="flex-1 space-y-3 max-h-[240px] overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#eee]">{tpl.name} 편집</h3>
                      <button
                        onClick={() => setSelectedSlide(null)}
                        className="text-xs text-[#666] hover:text-white"
                      >
                        닫기
                      </button>
                    </div>
                    {Object.entries(tpl.propsSchema).map(([key, schema]) => {
                      const resolved = resolveSlideProps(sl); const value = resolved[key];
                      if (schema.type === "string") {
                        const isLong = typeof value === "string" && value.length > 40;
                        return (
                          <div key={key}>
                            <label className="text-[11px] text-[#888] block mb-1">{schema.label}</label>
                            {isLong ? (
                              <textarea
                                value={value ?? ""}
                                onChange={(e) => updateSlideField(selectedSlide.carouselId, selectedSlide.slideId, key, e.target.value)}
                                rows={3}
                                className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#eee] outline-none focus:border-[#ff6b35]/50 resize-none"
                              />
                            ) : (
                              <input
                                value={value ?? ""}
                                onChange={(e) => updateSlideField(selectedSlide.carouselId, selectedSlide.slideId, key, e.target.value)}
                                className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#eee] outline-none focus:border-[#ff6b35]/50"
                              />
                            )}
                          </div>
                        );
                      }
                      if (schema.type === "color") {
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <label className="text-[11px] text-[#888]">{schema.label}</label>
                            <input
                              type="color"
                              value={value ?? "#ff6b35"}
                              onChange={(e) => updateSlideField(selectedSlide.carouselId, selectedSlide.slideId, key, e.target.value)}
                              className="w-8 h-8 rounded border border-[#333] bg-transparent cursor-pointer"
                            />
                          </div>
                        );
                      }
                      if (schema.type === "string[]") {
                        const arr = Array.isArray(value) ? value : [];
                        return (
                          <div key={key}>
                            <label className="text-[11px] text-[#888] block mb-1">{schema.label}</label>
                            {arr.map((item: string, i: number) => (
                              <input
                                key={i}
                                value={item}
                                onChange={(e) => {
                                  const next = [...arr];
                                  next[i] = e.target.value;
                                  updateSlideField(selectedSlide.carouselId, selectedSlide.slideId, key, next);
                                }}
                                className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-[#eee] outline-none focus:border-[#ff6b35]/50 mb-1"
                              />
                            ))}
                            <button
                              onClick={() => updateSlideField(selectedSlide.carouselId, selectedSlide.slideId, key, [...arr, ""])}
                              className="text-[11px] text-[#ff6b35] hover:underline"
                            >
                              + 항목 추가
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </BottomSheet>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTemplate ? (
          <div className="px-4 py-2 rounded-lg bg-[#ff6b35] text-white text-xs font-semibold shadow-2xl">
            {activeTemplate.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
