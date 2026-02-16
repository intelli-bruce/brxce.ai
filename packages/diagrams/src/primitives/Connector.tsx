/**
 * Connector — responsive arrows and badges.
 * Sketch mode: rough.js hand-drawn lines.
 */
"use client";

import { useRef, useEffect } from "react";
import { color, font, space, connector, radius, s } from "../tokens";
import { useScale, useSketch } from "../components/DiagramShell";

/* ─── Sketch circle helper ─── */
function SketchCircle({
  size,
  stroke,
  fill,
  children,
}: {
  size: number;
  stroke: string;
  fill?: string;
  children?: React.ReactNode;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    import("roughjs").then((mod) => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const rc = mod.default.svg(svg);
      const node = rc.circle(size / 2, size / 2, size - 4, {
        stroke,
        strokeWidth: 1.5,
        roughness: 2,
        fill: fill || undefined,
        fillStyle: fill ? "solid" : undefined,
        seed: 42,
      });
      svg.appendChild(node);
    });
  }, [size, stroke, fill]);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg ref={svgRef} width={size} height={size} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

/* ─── ArrowBadge ─── */
interface ArrowBadgeProps {
  symbol?: string;
  highlight?: boolean;
  accentColor?: string;
  size?: number;
}

export function ArrowBadge({
  symbol = "→",
  highlight = false,
  accentColor,
  size = connector.badge.size,
}: ArrowBadgeProps) {
  const { factor } = useScale();
  const sketch = useSketch();
  const accent = accentColor ?? color.primary;
  const sz = s(size, factor);
  const textColor = highlight ? accent : color.textDim;

  if (sketch) {
    return (
      <SketchCircle
        size={sz}
        stroke={highlight ? accent : color.borderStrong}
        fill={highlight ? `${accent}15` : color.surfaceRaised}
      >
        <span style={{ fontSize: s(connector.badge.fontSize, factor), color: textColor }}>{symbol}</span>
      </SketchCircle>
    );
  }

  const bg = highlight ? `${accent}22` : color.surfaceRaised;
  const border = highlight ? accent : color.borderStrong;

  return (
    <div
      style={{
        width: sz,
        height: sz,
        borderRadius: "50%",
        background: bg,
        border: `1px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: s(connector.badge.fontSize, factor),
        color: textColor,
        flexShrink: 0,
      }}
    >
      {symbol}
    </div>
  );
}

/* ─── LargeArrow ─── */
interface LargeArrowProps {
  label?: string;
  accentColor?: string;
}

export function LargeArrow({ label, accentColor }: LargeArrowProps) {
  const { factor } = useScale();
  const sketch = useSketch();
  const accent = accentColor ?? color.primary;
  const sz = s(48, factor);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: `0 ${s(space.lg, factor)}px`,
        gap: s(space.sm, factor),
      }}
    >
      {label && (
        <div
          style={{
            fontSize: s(font.size.caption - 1, factor),
            fontWeight: font.weight.bold,
            color: accent,
            textTransform: "uppercase",
            letterSpacing: font.letterSpacing.caps,
          }}
        >
          {label}
        </div>
      )}
      {sketch ? (
        <SketchCircle size={sz} stroke={accent} fill={`${accent}15`}>
          <span style={{ fontSize: s(22, factor), color: accent }}>→</span>
        </SketchCircle>
      ) : (
        <div
          style={{
            width: sz,
            height: sz,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
            border: `1.5px solid ${accent}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: s(22, factor),
            color: accent,
            boxShadow: `0 0 ${s(24, factor)}px ${accent}22`,
          }}
        >
          →
        </div>
      )}
    </div>
  );
}

/* ─── SketchVerticalLine ─── */
function SketchVerticalLine({ h, c }: { h: number; c: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    import("roughjs").then((mod) => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const rc = mod.default.svg(svg);
      const line = rc.line(2, 0, 2, h, { stroke: c, strokeWidth: 1.5, roughness: 2, seed: 77 });
      svg.appendChild(line);
    });
  }, [c, h]);
  return <svg ref={svgRef} width={4} height={h} />;
}

/* ─── VerticalLine ─── */
interface VerticalLineProps {
  height?: number;
  fade?: "top" | "bottom";
  lineColor?: string;
}

export function VerticalLine({ height = 20, fade = "top", lineColor }: VerticalLineProps) {
  const { factor } = useScale();
  const sketch = useSketch();
  const c = lineColor ?? color.textDim;
  const h = s(height, factor);

  if (sketch) return <SketchVerticalLine h={h} c={c} />;

  const gradient =
    fade === "top"
      ? `linear-gradient(180deg, ${c}, transparent)`
      : `linear-gradient(180deg, transparent, ${c})`;

  return (
    <div style={{ width: Math.max(1, s(1.5, factor)), height: h, background: gradient }} />
  );
}

/* ─── ConnectorLabel ─── */
export function ConnectorLabel({ children }: { children: React.ReactNode }) {
  const { factor } = useScale();
  const sketch = useSketch();
  return (
    <div
      style={{
        fontSize: s(font.size.tiny, factor),
        color: color.textDim,
        padding: `${s(2, factor)}px ${s(space.sm + 2, factor)}px`,
        border: sketch ? `1px dashed ${color.borderStrong}` : `1px solid ${color.border}`,
        borderRadius: sketch ? 0 : radius.pill,
        background: sketch ? "transparent" : color.bg,
      }}
    >
      {children}
    </div>
  );
}
