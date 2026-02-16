/**
 * SketchLine — Excalidraw-style hand-drawn line/arrow using rough.js
 */
"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";
import { color } from "../tokens";

export interface SketchLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  /** Show arrowhead */
  arrow?: boolean;
  seed?: number;
  style?: React.CSSProperties;
}

export function SketchLine({
  x1,
  y1,
  x2,
  y2,
  stroke = color.border,
  strokeWidth = 1.5,
  roughness = 1.2,
  arrow = false,
  seed,
  style,
}: SketchLineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const w = Math.abs(x2 - x1) + 20;
  const h = Math.abs(y2 - y1) + 20;
  const ox = Math.min(x1, x2) - 10;
  const oy = Math.min(y1, y2) - 10;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    const lx1 = x1 - ox, ly1 = y1 - oy, lx2 = x2 - ox, ly2 = y2 - oy;
    const s = seed ?? Math.floor(Math.random() * 2 ** 31);

    const line = rc.line(lx1, ly1, lx2, ly2, {
      stroke,
      strokeWidth,
      roughness,
      seed: s,
    });
    svg.appendChild(line);

    if (arrow) {
      const angle = Math.atan2(ly2 - ly1, lx2 - lx1);
      const headLen = strokeWidth * 8;
      const a1x = lx2 - headLen * Math.cos(angle - Math.PI / 6);
      const a1y = ly2 - headLen * Math.sin(angle - Math.PI / 6);
      const a2x = lx2 - headLen * Math.cos(angle + Math.PI / 6);
      const a2y = ly2 - headLen * Math.sin(angle + Math.PI / 6);

      svg.appendChild(rc.line(lx2, ly2, a1x, a1y, { stroke, strokeWidth, roughness: roughness * 0.5, seed: s + 1 }));
      svg.appendChild(rc.line(lx2, ly2, a2x, a2y, { stroke, strokeWidth, roughness: roughness * 0.5, seed: s + 2 }));
    }
  }, [x1, y1, x2, y2, stroke, strokeWidth, roughness, arrow, seed, ox, oy]);

  return (
    <svg
      ref={svgRef}
      width={w}
      height={h}
      style={{ position: "absolute", left: ox, top: oy, pointerEvents: "none", ...style }}
    />
  );
}
