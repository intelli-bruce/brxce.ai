/**
 * Connector — responsive arrows and badges. Uses useScale.
 */
"use client";

import { color, font, space, connector, radius, s } from "../tokens";
import { useScale } from "../components/DiagramShell";

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
  const accent = accentColor ?? color.primary;
  const bg = highlight ? `${accent}22` : color.surfaceRaised;
  const border = highlight ? accent : color.borderStrong;
  const textColor = highlight ? accent : color.textDim;
  const sz = s(size, factor);

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
    </div>
  );
}

/* ─── VerticalLine ─── */
interface VerticalLineProps {
  height?: number;
  fade?: "top" | "bottom";
  lineColor?: string;
}

export function VerticalLine({ height = 20, fade = "top", lineColor }: VerticalLineProps) {
  const { factor } = useScale();
  const c = lineColor ?? color.textDim;
  const gradient =
    fade === "top"
      ? `linear-gradient(180deg, ${c}, transparent)`
      : `linear-gradient(180deg, transparent, ${c})`;

  return (
    <div style={{ width: Math.max(1, s(1.5, factor)), height: s(height, factor), background: gradient }} />
  );
}

/* ─── ConnectorLabel ─── */
export function ConnectorLabel({ children }: { children: React.ReactNode }) {
  const { factor } = useScale();
  return (
    <div
      style={{
        fontSize: s(font.size.tiny, factor),
        color: color.textDim,
        padding: `${s(2, factor)}px ${s(space.sm + 2, factor)}px`,
        border: `1px solid ${color.border}`,
        borderRadius: radius.pill,
        background: color.bg,
      }}
    >
      {children}
    </div>
  );
}
