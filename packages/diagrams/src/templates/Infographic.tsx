"use client";

import { color, font, space, radius, s, type RatioPreset } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";

export interface InfographicSection {
  heading: string;
  items: string[];
}

export interface InfographicProps {
  title: string;
  sections: InfographicSection[];
  ratio?: RatioPreset;
  avatarUrl?: string;
  sketch?: boolean;
  exportMode?: { width: number; height: number };
}

function InfographicInner({ title, sections }: Pick<InfographicProps, "title" | "sections">) {
  const { factor } = useScale();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      {/* Title */}
      <div
        style={{
          fontSize: s(font.size.title, factor),
          fontWeight: font.weight.black,
          lineHeight: font.lineHeight.tight,
          letterSpacing: font.letterSpacing.tight,
          color: color.text,
          paddingBottom: s(space.lg, factor),
          borderBottom: `2px solid ${color.primary}`,
          marginBottom: s(space.lg, factor),
        }}
      >
        {title}
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: s(space.lg, factor), flex: 1, overflow: "hidden" }}>
        {sections.map((section, i) => (
          <div
            key={i}
            style={{
              background: color.surface,
              border: `1px solid ${color.border}`,
              borderRadius: s(radius.md, factor),
              padding: s(space.lg, factor),
            }}
          >
            {/* Section heading */}
            <div
              style={{
                fontSize: s(font.size.heading, factor),
                fontWeight: font.weight.bold,
                color: color.primary,
                marginBottom: s(space.sm, factor),
              }}
            >
              {section.heading}
            </div>

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: s(space.xs, factor) }}>
              {section.items.map((item, j) => (
                <div
                  key={j}
                  style={{
                    fontSize: s(font.size.body, factor),
                    color: color.textSecondary,
                    lineHeight: font.lineHeight.normal,
                    paddingLeft: s(space.md, factor),
                    borderLeft: `2px solid ${color.borderStrong}`,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

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

export function Infographic({ title, sections, ratio = "insta-4:5", avatarUrl, sketch, exportMode }: InfographicProps) {
  return (
    <DiagramShell ratio={ratio} avatarUrl={avatarUrl} sketch={sketch} exportMode={exportMode}>
      <InfographicInner title={title} sections={sections} />
    </DiagramShell>
  );
}
