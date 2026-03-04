"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SLIDE_TEMPLATES } from "@/lib/studio/slide-templates";
import type { Carousel } from "@/lib/studio/carousel-store";

function resolveProps(slide: any, slideIndex: number, totalSlides: number) {
  const tpl = SLIDE_TEMPLATES.find((t) => t.id === slide.templateId);
  if (!tpl) return {};

  const FIELD_ALIASES: Record<string, string[]> = {
    title: ["title", "heading", "question", "overline", "eventName", "statLabel"],
    subtitle: ["subtitle", "subQuestion", "detail", "teaser", "caption", "reason", "guide"],
    body: ["body", "content", "quote", "tip"],
    imageUrl: ["imageUrl", "backgroundImageUrl"],
    items: ["items", "points", "steps", "nodes", "beforeItems", "afterItems"],
    steps: ["steps"],
  };

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

export default function CarouselDetailPage() {
  const params = useParams();
  const [carousel, setCarousel] = useState<Carousel | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/carousels/${params.id}`)
      .then((r) => r.json())
      .then((d) => setCarousel(d.carousel ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-[#666] p-8">로딩 중...</p>;
  if (!carousel) return <p className="text-[#666] p-8">캐러셀을 찾을 수 없습니다.</p>;

  const slide = carousel.slides[selectedSlide];
  const activeTemplateId = previewTemplateId || slide?.templateId;
  const tpl = activeTemplateId ? SLIDE_TEMPLATES.find((t) => t.id === activeTemplateId) : null;
  const Comp = tpl?.component;

  // 미리보기용 slide (previewTemplateId가 있으면 templateId만 교체)
  const previewSlide = previewTemplateId
    ? { ...slide, templateId: previewTemplateId }
    : slide;
  const props = previewSlide ? resolveProps(previewSlide, selectedSlide, carousel.slides.length) : {};

  // 같은 카테고리의 대체 템플릿들
  const currentCategory = slide?.category;
  const alternativeTemplates = SLIDE_TEMPLATES.filter(
    (t) => t.category === currentCategory
  );

  const applyTemplate = async (newTemplateId: string) => {
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
        <div className="flex-1 flex justify-center">
          <div
            className="border border-[#222] rounded-xl overflow-hidden"
            style={{ width: 540, height: 675 }}
          >
            {Comp ? (
              <div
                style={{
                  transform: "scale(0.5)",
                  transformOrigin: "top left",
                  width: 1080,
                  height: 1350,
                }}
              >
                <Comp {...props} />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#555]">
                템플릿을 찾을 수 없습니다
              </div>
            )}
          </div>
        </div>
        {/* 우측 패널 */}
        <div className="w-72 shrink-0 flex flex-col gap-4">
          {/* 슬라이드 정보 */}
          <div className="bg-[#0f0f0f] border border-[#222] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[#fafafa] mb-3">슬라이드 정보</h3>
            <dl className="flex flex-col gap-2 text-xs">
              <div>
                <dt className="text-[#555]">템플릿</dt>
                <dd className="text-[#aaa] mt-0.5 flex items-center gap-2">
                  {slide?.templateId}
                  {previewTemplateId && (
                    <span className="text-[#ff6b35]">→ {previewTemplateId}</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[#555]">카테고리</dt>
                <dd className="text-[#aaa] mt-0.5">{slide?.category}</dd>
              </div>
              <div>
                <dt className="text-[#555]">라벨</dt>
                <dd className="text-[#aaa] mt-0.5">{slide?.label}</dd>
              </div>
              {slide?.content?.title && (
                <div>
                  <dt className="text-[#555]">제목</dt>
                  <dd className="text-[#aaa] mt-0.5 whitespace-pre-wrap">
                    {slide.content.title}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-col gap-2">
            {/* 원본 크기 보기 */}
            <a
              href={`/render/${carousel.id}?slide=${selectedSlide}`}
              target="_blank"
              rel="noopener"
              className="block w-full text-center px-4 py-2.5 text-xs rounded-lg bg-[#ff6b35] text-white no-underline hover:bg-[#e55a28] transition-colors font-medium"
            >
              원본 크기로 보기 (1080×1350)
            </a>

            {/* 템플릿 수정 (Konva 에디터) */}
            <Link
              href={`/studio/editor?carousel=${carousel.id}&slide=${selectedSlide}`}
              className="block w-full text-center px-4 py-2.5 text-xs rounded-lg bg-[#1a1a1a] text-[#aaa] hover:text-[#fafafa] hover:bg-[#222] border border-[#333] no-underline transition-colors font-medium"
            >
              🎨 에디터에서 수정 ({tpl?.name})
            </Link>

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
              🔄 다른 템플릿 적용
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
              key={s.id}
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
              style={{ width: 154, height: 192 }}
            >
              {ThumbComp ? (
                <div
                  className="pointer-events-none"
                  style={{
                    transform: `scale(${154 / 1080})`,
                    transformOrigin: "top left",
                    width: 1080,
                    height: 1350,
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
