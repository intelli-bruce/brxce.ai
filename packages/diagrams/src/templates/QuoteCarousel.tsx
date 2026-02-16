"use client";

import { color, font, space, s, type RatioPreset } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";

export interface QuoteCarouselProps {
  quotes: { text: string; author: string }[];
  slideIndex?: number;
  ratio?: RatioPreset;
  avatarUrl?: string;
  sketch?: boolean;
  exportMode?: { width: number; height: number };
}

function QuoteSlide({ quote }: { quote: { text: string; author: string } }) {
  const { factor } = useScale();
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", gap: s(space.xxl, factor), textAlign: "center", padding: s(space.xxl, factor) }}>
      <div style={{ fontSize: s(64, factor), color: color.primaryDim, lineHeight: 1, fontFamily: font.family.sans }}>"</div>
      <blockquote style={{ fontSize: s(22, factor), fontWeight: font.weight.medium, color: color.text, lineHeight: font.lineHeight.relaxed, margin: 0, fontStyle: "italic" }}>
        {quote.text}
      </blockquote>
      <div style={{ display: "flex", alignItems: "center", gap: s(space.md, factor) }}>
        <div style={{ width: s(24, factor), height: 1, background: color.primary }} />
        <span style={{ fontSize: s(font.size.body, factor), color: color.textMuted, fontWeight: font.weight.medium }}>
          {quote.author}
        </span>
        <div style={{ width: s(24, factor), height: 1, background: color.primary }} />
      </div>
    </div>
  );
}

function QuoteCarouselInner(props: QuoteCarouselProps) {
  const { quotes, slideIndex } = props;
  const idx = slideIndex ?? 0;
  const quote = quotes[idx] ?? quotes[0];
  if (!quote) return null;
  return <QuoteSlide quote={quote} />;
}

export function QuoteCarousel({ ratio = "insta-4:5", avatarUrl, sketch, exportMode, ...rest }: QuoteCarouselProps) {
  return (
    <DiagramShell ratio={ratio} avatarUrl={avatarUrl} sketch={sketch} exportMode={exportMode}>
      <QuoteCarouselInner {...rest} ratio={ratio} />
    </DiagramShell>
  );
}
