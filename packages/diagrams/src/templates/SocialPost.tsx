"use client";

import { color, font, space, radius, s, type RatioPreset } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";

export interface SocialPostProps {
  text: string;
  cta?: string;
  ratio?: RatioPreset;
  avatarUrl?: string;
  sketch?: boolean;
  exportMode?: { width: number; height: number };
}

function SocialPostInner({ text, cta }: Pick<SocialPostProps, "text" | "cta">) {
  const { factor } = useScale();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", position: "relative" }}>
      {/* Main text */}
      <div
        style={{
          fontSize: s(font.size.title, factor),
          fontWeight: font.weight.bold,
          lineHeight: font.lineHeight.relaxed,
          color: color.text,
          maxWidth: "85%",
        }}
      >
        {text}
      </div>

      {/* CTA button */}
      {cta && (
        <div
          style={{
            marginTop: s(space.xxl, factor),
            background: color.primary,
            color: color.bg,
            fontSize: s(font.size.body, factor),
            fontWeight: font.weight.bold,
            padding: `${s(space.md, factor)}px ${s(space.xxl, factor)}px`,
            borderRadius: s(radius.pill, factor),
            letterSpacing: font.letterSpacing.normal,
          }}
        >
          {cta}
        </div>
      )}

      {/* brxce.ai — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: s(space.sm, factor),
          right: s(space.sm, factor),
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

export function SocialPost({ text, cta, ratio = "square-1:1", avatarUrl, sketch, exportMode }: SocialPostProps) {
  return (
    <DiagramShell ratio={ratio} avatarUrl={avatarUrl} sketch={sketch} exportMode={exportMode}>
      <SocialPostInner text={text} cta={cta} />
    </DiagramShell>
  );
}
