"use client";

import { color, font, space, radius, card, s, type RatioPreset } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";

export interface ListCarouselProps {
  title?: string;
  items: { label: string; desc?: string }[];
  slideIndex?: number;
  ratio?: RatioPreset;
  avatarUrl?: string;
  sketch?: boolean;
  exportMode?: { width: number; height: number };
}

function OverviewSlide({ title, items }: { title?: string; items: ListCarouselProps["items"] }) {
  const { factor } = useScale();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: s(space.lg, factor) }}>
      {title && (
        <h1 style={{ fontSize: s(font.size.title, factor), fontWeight: font.weight.black, color: color.text, letterSpacing: font.letterSpacing.tight, margin: 0, textAlign: "center" }}>
          {title}
        </h1>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: s(space.sm, factor), justifyContent: "center" }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: s(space.md, factor), padding: `${s(space.sm, factor)}px ${s(space.md, factor)}px`, borderLeft: `2px solid ${color.primary}`, borderRadius: s(radius.sm, factor) }}>
            <span style={{ fontSize: s(font.size.caption, factor), fontWeight: font.weight.bold, color: color.primary, minWidth: s(20, factor) }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontSize: s(font.size.body, factor), color: color.text, fontWeight: font.weight.medium }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemSlide({ item, index }: { item: { label: string; desc?: string }; index: number }) {
  const { factor } = useScale();
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", gap: s(space.xl, factor), padding: s(space.xxl, factor) }}>
      <span style={{ fontSize: s(48, factor), fontWeight: font.weight.black, color: color.primary, lineHeight: 1 }}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <h2 style={{ fontSize: s(font.size.title, factor), fontWeight: font.weight.bold, color: color.text, lineHeight: font.lineHeight.tight, margin: 0 }}>
        {item.label}
      </h2>
      {item.desc && (
        <p style={{ fontSize: s(font.size.body, factor), color: color.textSecondary, lineHeight: font.lineHeight.relaxed, margin: 0 }}>
          {item.desc}
        </p>
      )}
    </div>
  );
}

function ListCarouselInner(props: ListCarouselProps) {
  const { title, items, slideIndex } = props;
  if (slideIndex === undefined) return <OverviewSlide title={title} items={items} />;
  const item = items[slideIndex];
  if (!item) return <OverviewSlide title={title} items={items} />;
  return <ItemSlide item={item} index={slideIndex} />;
}

export function ListCarousel({ ratio = "insta-4:5", avatarUrl, sketch, exportMode, ...rest }: ListCarouselProps) {
  return (
    <DiagramShell ratio={ratio} avatarUrl={avatarUrl} sketch={sketch} exportMode={exportMode}>
      <ListCarouselInner {...rest} ratio={ratio} />
    </DiagramShell>
  );
}
