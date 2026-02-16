"use client";

import { color, font, space, s, type RatioPreset } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";

export interface QuoteProps {
  quote: string;
  author: string;
  authorRole?: string;
  ratio?: RatioPreset;
  avatarUrl?: string;
  sketch?: boolean;
  exportMode?: { width: number; height: number };
}

function QuoteInner({ quote, author, authorRole }: Pick<QuoteProps, "quote" | "author" | "authorRole">) {
  const { factor } = useScale();

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", position: "relative", padding: `${s(space.xl, factor)}px` }}>
      {/* Large quotation mark */}
      <div
        style={{
          fontSize: s(80, factor),
          fontWeight: font.weight.black,
          lineHeight: 1,
          color: color.primary,
          opacity: 0.6,
          marginBottom: s(space.sm, factor),
          fontFamily: font.family.sans,
        }}
      >
        {"\u201C"}
      </div>

      {/* Quote text */}
      <div
        style={{
          fontSize: s(font.size.title, factor),
          fontWeight: font.weight.medium,
          lineHeight: font.lineHeight.relaxed,
          color: color.text,
          maxWidth: "90%",
        }}
      >
        {quote}
      </div>

      {/* Author */}
      <div style={{ marginTop: s(space.xxl, factor) }}>
        <div
          style={{
            fontSize: s(font.size.body, factor),
            fontWeight: font.weight.bold,
            color: color.primary,
          }}
        >
          {author}
        </div>
        {authorRole && (
          <div
            style={{
              fontSize: s(font.size.caption, factor),
              fontWeight: font.weight.normal,
              color: color.textMuted,
              marginTop: s(space.xs, factor),
            }}
          >
            {authorRole}
          </div>
        )}
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

export function Quote({ quote, author, authorRole, ratio = "square-1:1", avatarUrl, sketch, exportMode }: QuoteProps) {
  return (
    <DiagramShell ratio={ratio} avatarUrl={avatarUrl} sketch={sketch} exportMode={exportMode}>
      <QuoteInner quote={quote} author={author} authorRole={authorRole} />
    </DiagramShell>
  );
}
