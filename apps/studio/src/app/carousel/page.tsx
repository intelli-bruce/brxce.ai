"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Carousel } from "@/lib/studio/carousel-store";
import { SLIDE_TEMPLATES } from "@/lib/studio/slide-templates";
import { canvas } from "@/lib/studio/slide-tokens";

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

/** canvas → 20% scale thumbnail */
const THUMB_SCALE = 0.2;
const THUMB_W = Math.round(canvas.width * THUMB_SCALE);
const THUMB_H = Math.round(canvas.height * THUMB_SCALE);

function SlideThumbnail({ slide, slideIndex, totalSlides }: { slide: any; slideIndex: number; totalSlides: number }) {
  const tpl = SLIDE_TEMPLATES.find((t) => t.id === slide.templateId);
  if (!tpl) return <div className="w-full h-full flex items-center justify-center text-xs text-[#555]">{slideIndex + 1}</div>;
  const Comp = tpl.component;
  const props = resolveProps(slide, slideIndex, totalSlides);

  return (
    <div className="w-full h-full overflow-hidden">
      <div
        style={{
          transform: `scale(${THUMB_SCALE})`,
          transformOrigin: "top left",
          width: canvas.width,
          height: canvas.height,
          pointerEvents: "none",
        }}
      >
        <Comp {...props} />
      </div>
    </div>
  );
}

export default function CarouselListPage() {
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/carousels")
      .then((r) => r.json())
      .then((d) => setCarousels(d.carousels ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("이 캐러셀을 삭제할까요?")) return;
    await fetch(`/api/carousels/${id}`, { method: "DELETE" });
    setCarousels((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#fafafa]">캐러셀</h1>
          <p className="text-sm text-[#666] mt-1">
            생성된 캐러셀 목록 · 미리보기 · 렌더링
          </p>
        </div>
        <span className="text-xs text-[#555]">{carousels.length}개</span>
      </div>

      {loading ? (
        <p className="text-[#666]">로딩 중...</p>
      ) : carousels.length === 0 ? (
        <div className="text-center py-20 text-[#555]">
          <p className="text-lg mb-2">캐러셀이 없습니다</p>
          <p className="text-sm">API로 캐러셀을 생성하면 여기에 표시됩니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {carousels.map((c) => (
            <Link
              key={c.id}
              href={`/carousel/${c.id}`}
              className="block border border-[#222] rounded-2xl bg-[#0f0f0f] hover:bg-[#141414] hover:border-[#333] transition-all no-underline"
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-[#fafafa] truncate">
                    {c.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#666]">
                    <span>{c.slides.length}장</span>
                    <span>·</span>
                    <span>
                      {c.slides
                        .map((s) => s.templateId)
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .join(", ")}
                    </span>
                    <span>·</span>
                    <span>{new Date(c.createdAt).toLocaleDateString("ko-KR")}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(c.id);
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-transparent text-[#444] hover:text-red-400 hover:bg-[#1a1a1a] border-none cursor-pointer transition-colors"
                >
                  삭제
                </button>
              </div>

              {/* 슬라이드 썸네일 스트립 */}
              <div className="px-6 pb-5 overflow-hidden">
                <div className="flex gap-2.5 flex-wrap">
                  {c.slides.map((slide, idx) => (
                    <div
                      key={slide.id ?? `slide-${idx}`}
                      className="shrink-0 rounded-lg border border-[#1a1a1a] overflow-hidden bg-[#0a0a0a]"
                      style={{ width: THUMB_W, height: THUMB_H }}
                    >
                      <SlideThumbnail slide={slide} slideIndex={idx} totalSlides={c.slides.length} />
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
