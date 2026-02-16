/**
 * Card — responsive base container.
 * Automatically switches to rough.js sketch style when DiagramShell has sketch=true.
 */
"use client";

import { useRef, useEffect } from "react";
import { card as cardTokens, radius, color, font, space, cardHeader, cardBody, s } from "../tokens";
import { useScale, useSketch } from "../components/DiagramShell";

export type CardVariant = "default" | "highlight" | "ghost";

/* ─── Sketch overlay (rough.js) ─── */
function SketchBorder({
  stroke,
  strokeWidth,
  fill,
}: {
  stroke: string;
  strokeWidth: number;
  fill?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    // Dynamic import rough.js to avoid SSR issues
    import("roughjs").then((mod) => {
      const rough = mod.default;
      const w = container.clientWidth;
      const h = container.clientHeight;
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));

      while (svg.firstChild) svg.removeChild(svg.firstChild);

      const rc = rough.svg(svg);
      const pad = strokeWidth;
      const node = rc.rectangle(pad, pad, w - pad * 2, h - pad * 2, {
        stroke,
        strokeWidth,
        roughness: 2,
        bowing: 1.5,
        fill: fill || undefined,
        fillStyle: fill ? "solid" : undefined,
        seed: Math.floor(Math.random() * 2 ** 16),
      });
      svg.appendChild(node);
    });
  }, [stroke, strokeWidth, fill]);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
    >
      <svg ref={svgRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}

/* ─── Card ─── */
interface CardProps {
  variant?: CardVariant;
  accentColor?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  flex?: number;
}

export function Card({ variant = "default", accentColor, children, style, flex }: CardProps) {
  const tokens = cardTokens[variant];
  const accent = accentColor ?? color.primary;
  const { factor } = useScale();
  const sketch = useSketch();

  const isHL = variant === "highlight";

  // Clean mode styles
  const bg =
    isHL && accentColor
      ? `linear-gradient(180deg, ${accent}0A 0%, ${color.bg} 60%)`
      : tokens.background;
  const border =
    isHL && accentColor ? `1.5px solid ${accent}66` : tokens.border;
  const boxShadow =
    isHL && accentColor
      ? `0 0 40px ${accent}15, 0 4px 20px rgba(0,0,0,0.4)`
      : tokens.boxShadow;

  return (
    <div
      style={{
        position: "relative",
        // Sketch: transparent bg, no border/shadow (rough.js handles it)
        background: sketch ? "transparent" : bg,
        border: sketch ? "none" : border,
        borderRadius: sketch ? 0 : s(tokens.borderRadius, factor),
        boxShadow: sketch ? "none" : boxShadow,
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
        flex,
        ...style,
      }}
    >
      {sketch && (
        <SketchBorder
          stroke={isHL ? accent : color.borderStrong}
          strokeWidth={isHL ? 2.5 : 1.5}
          fill={isHL ? `${accent}08` : undefined}
        />
      )}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Card.Header ─── */
interface CardHeaderProps {
  variant?: CardVariant;
  accentColor?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function CardHeader({ variant = "default", accentColor, children, style }: CardHeaderProps) {
  const isHighlight = variant === "highlight";
  const accent = accentColor ?? color.primary;
  const { factor } = useScale();
  const sketch = useSketch();

  return (
    <div
      style={{
        padding: `${s(cardHeader.padding.y, factor)}px ${s(cardHeader.padding.x, factor)}px ${s(cardHeader.padding.bottom, factor)}px`,
        borderBottom: sketch ? "none" : (isHighlight ? `1px solid ${accent}33` : cardHeader.borderBottom.default),
        textAlign: "center",
        background: sketch ? "transparent" : (isHighlight ? `${accent}08` : cardHeader.background.default),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Card.Title ─── */
interface CardTitleProps {
  variant?: CardVariant;
  accentColor?: string;
  children: React.ReactNode;
}

export function CardTitle({ variant = "default", accentColor, children }: CardTitleProps) {
  const isHighlight = variant === "highlight";
  const accent = accentColor ?? color.primary;
  const { factor } = useScale();

  return (
    <div
      style={{
        fontSize: s(font.size.heading, factor),
        fontWeight: font.weight.bold,
        color: isHighlight ? accent : color.text,
        letterSpacing: font.letterSpacing.normal,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Card.Subtitle ─── */
export function CardSubtitle({ children }: { children: React.ReactNode }) {
  const { factor } = useScale();
  return (
    <div style={{ fontSize: s(font.size.caption, factor), color: color.textMuted, marginTop: s(space.xs, factor) }}>
      {children}
    </div>
  );
}

/* ─── Card.Body ─── */
export function CardBody({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { factor } = useScale();
  return (
    <div
      style={{
        padding: `${s(cardBody.padding.y, factor)}px ${s(cardBody.padding.x, factor)}px`,
        display: "flex",
        flexDirection: "column",
        gap: s(cardBody.gap, factor),
        flex: 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
