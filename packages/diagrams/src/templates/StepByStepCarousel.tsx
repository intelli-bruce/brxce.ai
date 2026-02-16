"use client";

import { color, font, space, radius, s, type RatioPreset } from "../tokens";
import { DiagramShell, useScale } from "../components/DiagramShell";

export interface StepByStepCarouselProps {
  title?: string;
  steps: { number: number; title: string; desc: string }[];
  slideIndex?: number;
  ratio?: RatioPreset;
  avatarUrl?: string;
  sketch?: boolean;
  exportMode?: { width: number; height: number };
}

function CoverSlide({ title, stepCount }: { title?: string; stepCount: number }) {
  const { factor } = useScale();
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", gap: s(space.xxl, factor), textAlign: "center" }}>
      {title && (
        <h1 style={{ fontSize: s(36, factor), fontWeight: font.weight.black, color: color.text, lineHeight: font.lineHeight.tight, letterSpacing: font.letterSpacing.tight, margin: 0 }}>
          {title}
        </h1>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: s(space.md, factor) }}>
        <span style={{ fontSize: s(48, factor), fontWeight: font.weight.black, color: color.primary }}>{stepCount}</span>
        <span style={{ fontSize: s(font.size.heading, factor), color: color.textSecondary }}>Steps</span>
      </div>
      <div style={{ width: s(60, factor), height: 2, background: `linear-gradient(90deg, transparent, ${color.primary}, transparent)` }} />
    </div>
  );
}

function StepSlide({ step, total }: { step: { number: number; title: string; desc: string }; total: number }) {
  const { factor } = useScale();
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", gap: s(space.xl, factor), padding: s(space.xxl, factor) }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: s(space.md, factor) }}>
        <span style={{ fontSize: s(64, factor), fontWeight: font.weight.black, color: color.primary, lineHeight: 1 }}>
          {String(step.number).padStart(2, "0")}
        </span>
        <span style={{ fontSize: s(font.size.caption, factor), color: color.textDim }}>/ {String(total).padStart(2, "0")}</span>
      </div>
      <h2 style={{ fontSize: s(font.size.title, factor), fontWeight: font.weight.bold, color: color.text, lineHeight: font.lineHeight.tight, margin: 0 }}>
        {step.title}
      </h2>
      <p style={{ fontSize: s(font.size.body, factor), color: color.textSecondary, lineHeight: font.lineHeight.relaxed, margin: 0 }}>
        {step.desc}
      </p>
    </div>
  );
}

function StepByStepCarouselInner(props: StepByStepCarouselProps) {
  const { title, steps, slideIndex } = props;
  if (slideIndex === undefined) return <CoverSlide title={title} stepCount={steps.length} />;
  const step = steps[slideIndex];
  if (!step) return <CoverSlide title={title} stepCount={steps.length} />;
  return <StepSlide step={step} total={steps.length} />;
}

export function StepByStepCarousel({ ratio = "insta-4:5", avatarUrl, sketch, exportMode, ...rest }: StepByStepCarouselProps) {
  return (
    <DiagramShell ratio={ratio} avatarUrl={avatarUrl} sketch={sketch} exportMode={exportMode}>
      <StepByStepCarouselInner {...rest} ratio={ratio} />
    </DiagramShell>
  );
}
