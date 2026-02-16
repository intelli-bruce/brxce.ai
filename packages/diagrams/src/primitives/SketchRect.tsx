/**
 * SketchRect — Excalidraw-style hand-drawn rectangle using rough.js
 * Renders an SVG with sketchy borders and optional fill.
 */
"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";
import { useScale } from "../components/DiagramShell";
import { s, color } from "../tokens";

export interface SketchRectProps {
  width: number;
  height: number;
  /** Stroke color */
  stroke?: string;
  /** Fill color (hachure style) */
  fill?: string;
  /** Fill style: hachure, solid, zigzag, cross-hatch, dots */
  fillStyle?: "hachure" | "solid" | "zigzag" | "cross-hatch" | "dots";
  /** Roughness (0 = smooth, 3 = very rough) */
  roughness?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Border radius */
  borderRadius?: number;
  /** Seed for consistent rendering */
  seed?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function SketchRect({
  width,
  height,
  stroke = color.border,
  fill,
  fillStyle = "hachure",
  roughness = 1.2,
  strokeWidth = 1.5,
  borderRadius = 0,
  seed,
  children,
  style,
  className,
}: SketchRectProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Clear previous
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    const padding = strokeWidth * 2;
    const node = rc.rectangle(
      padding,
      padding,
      width - padding * 2,
      height - padding * 2,
      {
        stroke,
        fill: fill || undefined,
        fillStyle,
        roughness,
        strokeWidth,
        seed: seed ?? Math.floor(Math.random() * 2 ** 31),
        bowing: 1,
      }
    );
    svg.appendChild(node);
  }, [width, height, stroke, fill, fillStyle, roughness, strokeWidth, seed]);

  return (
    <div
      style={{ position: "relative", width, height, ...style }}
      className={className}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}
