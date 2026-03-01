"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { SLIDE_TEMPLATES } from "@/lib/studio/slide-templates";

const FIELD_ALIASES: Record<string, string[]> = {
  title: ["title", "heading", "question", "overline", "eventName", "statLabel"],
  subtitle: ["subtitle", "subQuestion", "detail", "teaser", "caption", "reason", "guide"],
  body: ["body", "content", "quote", "tip"],
  imageUrl: ["imageUrl", "backgroundImageUrl"],
  items: ["items", "points", "steps", "nodes", "beforeItems", "afterItems"],
  steps: ["steps"],
};

function contentToTemplateProps(content: Record<string, any>, schema: Record<string, any>) {
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

function resolveProps(slide: any, slideIndex: number, totalSlides: number) {
  const tpl = SLIDE_TEMPLATES.find((t) => t.id === slide.templateId);
  if (!tpl) return {};

  const fromContent = contentToTemplateProps(slide.content || {}, tpl.propsSchema);

  const bodyStepFallback =
    slide.templateId === "body-step" && Array.isArray(slide.content?.items)
      ? {
          steps:
            fromContent.steps ??
            slide.content.items.map((item: string, idx: number) => ({
              title: item,
              desc:
                idx === 0
                  ? "가장 자주 반복되는 업무를 하나로 좁혀 자동화 대상을 정합니다"
                  : idx === 1
                    ? "시작부터 완료까지의 절차를 체크리스트로 분해해 문서화합니다"
                    : "정의된 절차를 AI 에이전트에 연결해 실행과 검수를 맡깁니다",
            })),
        }
      : {};

  const bodyCompareFallback =
    slide.templateId === "body-compare"
      ? {
          beforeItems: slide.overrides?.beforeItems ?? slide.content?.beforeItems,
          afterItems: slide.overrides?.afterItems ?? slide.content?.afterItems,
        }
      : {};

  return {
    ...tpl.defaultProps,
    ...fromContent,
    ...bodyStepFallback,
    ...bodyCompareFallback,
    ...(slide.overrides || {}),
    slideNumber: `${slideIndex + 1}/${totalSlides}`,
  };
}

export default function RenderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slideIndex = parseInt(searchParams.get("slide") ?? "0", 10);

  const [carousel, setCarousel] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/carousels/${params.carouselId}`)
      .then((r) => r.json())
      .then((d) => setCarousel(d.carousel))
      .catch(console.error);
  }, [params.carouselId]);

  if (!carousel) return <div style={{ background: "#000", color: "#fff", padding: 40 }}>Loading...</div>;

  const slide = carousel.slides[slideIndex];
  if (!slide) return <div style={{ background: "#000", color: "#fff", padding: 40 }}>Slide not found</div>;

  const tpl = SLIDE_TEMPLATES.find((t) => t.id === slide.templateId);
  if (!tpl) return null;
  const Comp = tpl.component;
  const props = resolveProps(slide, slideIndex, carousel.slides.length);

  return (
    <div id="slide-root" style={{ width: 1080, height: 1350, margin: 0, padding: 0 }}>
      <Comp {...props} />
    </div>
  );
}
