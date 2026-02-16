"use client";

import { color, font, space, radius, card, s, type RatioPreset } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";

export interface BeforeAfterCarouselProps {
  before: { label: string; items: string[] };
  after: { label: string; items: string[] };
  slideIndex?: number;
  ratio?: RatioPreset;
  avatarUrl?: string;
  sketch?: boolean;
  exportMode?: { width: number; height: number };
}

function PanelCard({ label, items, accent }: { label: string; items: string[]; accent: string }) {
  const { factor } = useScale();
  return (
    <div style={{ flex: 1, ...card.default, padding: s(space.xl, factor), display: "flex", flexDirection: "column", gap: s(space.md, factor) }}>
      <div style={{ fontSize: s(font.size.heading, factor), fontWeight: font.weight.bold, color: accent, letterSpacing: font.letterSpacing.wide, textTransform: "uppercase" as const }}>
        {label}
      </div>
      <div style={{ width: "100%", height: 1, background: `${accent}33` }} />
      <div style={{ display: "flex", flexDirection: "column", gap: s(space.sm, factor) }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: s(space.sm, factor) }}>
            <span style={{ fontSize: s(font.size.tiny, factor), color: accent, marginTop: s(6, factor) }}>--</span>
            <span style={{ fontSize: s(font.size.body, factor), color: color.textSecondary, lineHeight: font.lineHeight.normal }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SinglePanel({ data, accent }: { data: { label: string; items: string[] }; accent: string }) {
  const { factor } = useScale();
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", padding: s(space.xxl, factor) }}>
      <PanelCard label={data.label} items={data.items} accent={accent} />
    </div>
  );
}

function PreviewSlide({ before, after }: { before: BeforeAfterCarouselProps["before"]; after: BeforeAfterCarouselProps["after"] }) {
  const { factor } = useScale();
  return (
    <div style={{ display: "flex", gap: s(space.lg, factor), height: "100%", alignItems: "stretch", paddingTop: s(space.lg, factor) }}>
      <PanelCard label={before.label} items={before.items} accent={color.negative} />
      <PanelCard label={after.label} items={after.items} accent={color.positive} />
    </div>
  );
}

function BeforeAfterCarouselInner(props: BeforeAfterCarouselProps) {
  const { before, after, slideIndex } = props;
  if (slideIndex === undefined) return <PreviewSlide before={before} after={after} />;
  if (slideIndex === 0) return <SinglePanel data={before} accent={color.negative} />;
  return <SinglePanel data={after} accent={color.positive} />;
}

export function BeforeAfterCarousel({ ratio = "insta-4:5", avatarUrl, sketch, exportMode, ...rest }: BeforeAfterCarouselProps) {
  return (
    <DiagramShell ratio={ratio} avatarUrl={avatarUrl} sketch={sketch} exportMode={exportMode}>
      <BeforeAfterCarouselInner {...rest} ratio={ratio} />
    </DiagramShell>
  );
}
