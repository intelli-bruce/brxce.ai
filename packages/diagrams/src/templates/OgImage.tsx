"use client";

import { color, font, space, radius, s, type RatioPreset } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";

export interface OgImageProps {
  title: string;
  subtitle?: string;
  tag?: string;
  ratio?: RatioPreset;
  avatarUrl?: string;
  sketch?: boolean;
  exportMode?: { width: number; height: number };
}

function OgImageInner({ title, subtitle, tag }: Pick<OgImageProps, "title" | "subtitle" | "tag">) {
  const { factor } = useScale();

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", position: "relative" }}>
      {/* Tag badge — top left */}
      {tag && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            background: color.primary,
            color: color.bg,
            fontSize: s(font.size.caption, factor),
            fontWeight: font.weight.bold,
            padding: `${s(space.xs, factor)}px ${s(space.md, factor)}px`,
            borderRadius: s(radius.pill, factor),
            letterSpacing: font.letterSpacing.wide,
            textTransform: "uppercase" as const,
          }}
        >
          {tag}
        </div>
      )}

      {/* Title */}
      <div
        style={{
          fontSize: s(42, factor),
          fontWeight: font.weight.black,
          lineHeight: font.lineHeight.tight,
          letterSpacing: font.letterSpacing.tight,
          color: color.text,
          maxWidth: "85%",
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            fontSize: s(font.size.heading, factor),
            fontWeight: font.weight.normal,
            lineHeight: font.lineHeight.normal,
            color: color.textSecondary,
            marginTop: s(space.lg, factor),
            maxWidth: "75%",
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Accent line */}
      <div
        style={{
          width: s(60, factor),
          height: s(3, factor),
          background: color.primary,
          borderRadius: s(radius.pill, factor),
          marginTop: s(space.xl, factor),
        }}
      />

      {/* brxce.ai — bottom right */}
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

export function OgImage({ title, subtitle, tag, ratio = "blog-16:9", avatarUrl, sketch, exportMode }: OgImageProps) {
  return (
    <DiagramShell ratio={ratio} avatarUrl={avatarUrl} sketch={sketch} exportMode={exportMode}>
      <OgImageInner title={title} subtitle={subtitle} tag={tag} />
    </DiagramShell>
  );
}
