"use client";

import { color, font, space, radius, s, type RatioPreset } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";

export interface CardNewsCarouselProps {
  cover: { title: string; hook: string };
  slides: { point: string; detail?: string }[];
  cta: string;
  slideIndex?: number;
  ratio?: RatioPreset;
  avatarUrl?: string;
  sketch?: boolean;
  exportMode?: { width: number; height: number };
}

function CoverSlide({ cover }: { cover: CardNewsCarouselProps["cover"] }) {
  const { factor } = useScale();
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", gap: s(space.xxl, factor), textAlign: "center" }}>
      <h1 style={{ fontSize: s(36, factor), fontWeight: font.weight.black, color: color.text, lineHeight: font.lineHeight.tight, letterSpacing: font.letterSpacing.tight, margin: 0 }}>
        {cover.title}
      </h1>
      <p style={{ fontSize: s(font.size.heading, factor), fontWeight: font.weight.medium, color: color.textSecondary, lineHeight: font.lineHeight.normal, margin: 0 }}>
        {cover.hook}
      </p>
      <div style={{ width: s(60, factor), height: 2, background: `linear-gradient(90deg, transparent, ${color.primary}, transparent)` }} />
    </div>
  );
}

function ContentSlide({ slide, index }: { slide: { point: string; detail?: string }; index: number }) {
  const { factor } = useScale();
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", gap: s(space.xl, factor), textAlign: "center", padding: s(space.xxl, factor) }}>
      <div style={{ fontSize: s(48, factor), fontWeight: font.weight.black, color: color.primary, lineHeight: 1 }}>
        {String(index + 1).padStart(2, "0")}
      </div>
      <h2 style={{ fontSize: s(font.size.title, factor), fontWeight: font.weight.bold, color: color.text, lineHeight: font.lineHeight.tight, margin: 0 }}>
        {slide.point}
      </h2>
      {slide.detail && (
        <p style={{ fontSize: s(font.size.body, factor), color: color.textSecondary, lineHeight: font.lineHeight.relaxed, margin: 0 }}>
          {slide.detail}
        </p>
      )}
    </div>
  );
}

function CtaSlide({ cta }: { cta: string }) {
  const { factor } = useScale();
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", gap: s(space.xxl, factor), textAlign: "center" }}>
      <h2 style={{ fontSize: s(font.size.title, factor), fontWeight: font.weight.bold, color: color.text, lineHeight: font.lineHeight.tight, margin: 0 }}>
        {cta}
      </h2>
      <div style={{ padding: `${s(space.md, factor)}px ${s(space.xl, factor)}px`, background: color.primary, borderRadius: s(radius.pill, factor), fontSize: s(font.size.body, factor), fontWeight: font.weight.semibold, color: color.bg }}>
        brxce.ai
      </div>
    </div>
  );
}

function CardNewsCarouselInner(props: CardNewsCarouselProps) {
  const { cover, slides, cta, slideIndex } = props;
  if (slideIndex === undefined) return <CoverSlide cover={cover} />;
  if (slideIndex === 0) return <CoverSlide cover={cover} />;
  if (slideIndex <= slides.length) return <ContentSlide slide={slides[slideIndex - 1]} index={slideIndex - 1} />;
  return <CtaSlide cta={cta} />;
}

export function CardNewsCarousel({ ratio = "insta-4:5", avatarUrl, sketch, exportMode, ...rest }: CardNewsCarouselProps) {
  return (
    <DiagramShell ratio={ratio} avatarUrl={avatarUrl} sketch={sketch} exportMode={exportMode}>
      <CardNewsCarouselInner {...rest} ratio={ratio} />
    </DiagramShell>
  );
}
