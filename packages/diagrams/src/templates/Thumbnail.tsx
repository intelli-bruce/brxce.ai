"use client";

import { color, font, space, radius, s, type RatioPreset } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";

export interface ThumbnailProps {
  title: string;
  badge?: string;
  ratio?: RatioPreset;
  avatarUrl?: string;
  sketch?: boolean;
  exportMode?: { width: number; height: number };
}

function ThumbnailInner({ title, badge }: Pick<ThumbnailProps, "title" | "badge">) {
  const { factor } = useScale();

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", position: "relative" }}>
      {/* Badge pill — top left */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            background: color.primaryFaint,
            color: color.primary,
            fontSize: s(font.size.subheading, factor),
            fontWeight: font.weight.bold,
            padding: `${s(space.xs, factor)}px ${s(space.md, factor)}px`,
            borderRadius: s(radius.pill, factor),
            border: `1px solid ${color.primaryDim}`,
          }}
        >
          {badge}
        </div>
      )}

      {/* Big title */}
      <div
        style={{
          fontSize: s(52, factor),
          fontWeight: font.weight.black,
          lineHeight: font.lineHeight.tight,
          letterSpacing: font.letterSpacing.tight,
          color: color.text,
          maxWidth: "90%",
        }}
      >
        {title}
      </div>

      {/* Branding — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          fontSize: s(font.size.caption, factor),
          fontWeight: font.weight.semibold,
          color: color.textMuted,
          letterSpacing: font.letterSpacing.wide,
        }}
      >
        brxce.ai
      </div>
    </div>
  );
}

export function Thumbnail({ title, badge, ratio = "blog-16:9", avatarUrl, sketch, exportMode }: ThumbnailProps) {
  return (
    <DiagramShell ratio={ratio} avatarUrl={avatarUrl} sketch={sketch} exportMode={exportMode}>
      <ThumbnailInner title={title} badge={badge} />
    </DiagramShell>
  );
}
