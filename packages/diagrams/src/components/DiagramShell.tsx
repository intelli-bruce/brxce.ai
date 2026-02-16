/**
 * DiagramShell — responsive container for all diagrams.
 *
 * LAYOUT-FIRST: fills its parent container width, maintains aspect-ratio.
 * Computes a scale factor from actual width vs REF_WIDTH (1200px).
 * Passes scale factor + sketch mode via React context.
 */
"use client";

import { createContext, useContext, useRef, useState, useEffect } from "react";
import { color, font, space, REF_WIDTH, RATIO_PRESETS, type RatioPreset, type ScaleContext, s } from "../tokens";
import { Watermark } from "./Watermark";

/* ─── Diagram Context (scale + sketch) ─── */
interface DiagramCtx extends ScaleContext {
  sketch: boolean;
}

const Ctx = createContext<DiagramCtx>({ factor: 1, width: REF_WIDTH, height: 800, sketch: false });
export function useScale() { return useContext(Ctx); }
export function useSketch() { return useContext(Ctx).sketch; }

interface DiagramShellProps {
  ratio?: RatioPreset;
  title?: string;
  avatarUrl?: string;
  children: React.ReactNode;
  /** Hand-drawn Excalidraw style */
  sketch?: boolean;
  /** For export: force specific pixel dimensions instead of responsive */
  exportMode?: { width: number; height: number };
}

export function DiagramShell({
  ratio = "guide-3:2",
  title,
  avatarUrl,
  children,
  sketch = false,
  exportMode,
}: DiagramShellProps) {
  const preset = RATIO_PRESETS[ratio];
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<ScaleContext>({ factor: 1, width: REF_WIDTH, height: REF_WIDTH / preset.ratio });

  useEffect(() => {
    if (exportMode) {
      setScale({ factor: exportMode.width / REF_WIDTH, width: exportMode.width, height: exportMode.height });
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const observe = () => {
      const w = el.clientWidth;
      const h = w / preset.ratio;
      setScale({ factor: w / REF_WIDTH, width: w, height: h });
    };

    observe();
    const ro = new ResizeObserver(observe);
    ro.observe(el);
    return () => ro.disconnect();
  }, [preset.ratio, exportMode]);

  const isExport = !!exportMode;
  const ctx: DiagramCtx = { ...scale, sketch };

  return (
    <Ctx.Provider value={ctx}>
      <div
        ref={containerRef}
        id="diagram-export"
        style={{
          width: isExport ? exportMode.width : "100%",
          aspectRatio: isExport ? undefined : `${preset.ratio}`,
          height: isExport ? exportMode.height : undefined,
          backgroundColor: color.bg,
          position: "relative",
          overflow: "hidden",
          fontFamily: sketch ? "'Virgil', 'Segoe Print', 'Comic Neue', cursive" : font.family.sans,
          color: color.text,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale" as unknown as string,
          borderRadius: isExport ? 0 : 12,
        }}
      >
        {/* Subtle grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: sketch
              ? "none"
              : `
                linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
              `,
            backgroundSize: `${s(40, scale.factor)}px ${s(40, scale.factor)}px`,
            pointerEvents: "none",
          }}
        />

        {/* Top accent line (clean only) */}
        {!sketch && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: 2,
              background: `linear-gradient(90deg, transparent, ${color.primaryDim}, transparent)`,
            }}
          />
        )}

        {/* Title */}
        {title && (
          <div
            style={{
              position: "absolute",
              top: s(space.xxl, scale.factor),
              left: 0,
              right: 0,
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: s(font.size.title, scale.factor),
                fontWeight: sketch ? font.weight.bold : font.weight.black,
                letterSpacing: sketch ? "0" : font.letterSpacing.tight,
                ...(sketch
                  ? { color: color.text }
                  : {
                      background: `linear-gradient(135deg, ${color.text}, ${color.primary})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }),
              }}
            >
              {title}
            </span>
          </div>
        )}

        {/* Content area */}
        <div
          style={{
            position: "absolute",
            top: title ? s(76, scale.factor) : s(24, scale.factor),
            left: s(space.xxl, scale.factor),
            right: s(space.xxl, scale.factor),
            bottom: s(64, scale.factor),
          }}
        >
          {children}
        </div>

        <Watermark avatarUrl={avatarUrl} />
      </div>
    </Ctx.Provider>
  );
}
