/**
 * Connector — arrows and badges between sections.
 *
 * ArrowBadge: circular badge with icon/text (→, ×, etc.)
 * VerticalLine: dashed/gradient connector line
 * ConnectorLabel: small pill label on connectors
 */
import { color, font, space, connector, radius } from "../tokens";

/* ─── ArrowBadge ─── */
interface ArrowBadgeProps {
  /** Arrow or symbol to display */
  symbol?: string;
  /** Use primary accent styling */
  highlight?: boolean;
  /** Custom accent color */
  accentColor?: string;
  /** Badge size override */
  size?: number;
}

export function ArrowBadge({
  symbol = "→",
  highlight = false,
  accentColor,
  size = connector.badge.size,
}: ArrowBadgeProps) {
  const accent = accentColor ?? color.primary;
  const bg = highlight ? `${accent}22` : color.surfaceRaised;
  const border = highlight ? accent : color.borderStrong;
  const textColor = highlight ? accent : color.textDim;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        border: `1px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: connector.badge.fontSize,
        color: textColor,
        flexShrink: 0,
      }}
    >
      {symbol}
    </div>
  );
}

/* ─── Large Arrow (for Before→After style transitions) ─── */
interface LargeArrowProps {
  label?: string;
  accentColor?: string;
}

export function LargeArrow({ label, accentColor }: LargeArrowProps) {
  const accent = accentColor ?? color.primary;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: `0 ${space.lg}px`,
        gap: space.sm,
      }}
    >
      {label && (
        <div
          style={{
            fontSize: font.size.caption - 1,
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
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
          border: `1.5px solid ${accent}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          color: accent,
          boxShadow: `0 0 24px ${accent}22`,
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
  /** Gradient direction: top (fades from color) or bottom (fades to color) */
  fade?: "top" | "bottom";
  lineColor?: string;
}

export function VerticalLine({ height = 20, fade = "top", lineColor }: VerticalLineProps) {
  const c = lineColor ?? color.textDim;
  const gradient =
    fade === "top"
      ? `linear-gradient(180deg, ${c}, transparent)`
      : `linear-gradient(180deg, transparent, ${c})`;

  return (
    <div style={{ width: 1.5, height, background: gradient }} />
  );
}

/* ─── ConnectorLabel ─── */
export function ConnectorLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: font.size.tiny,
        color: color.textDim,
        padding: `2px ${space.sm + 2}px`,
        border: `1px solid ${color.border}`,
        borderRadius: radius.pill,
        background: color.bg,
      }}
    >
      {children}
    </div>
  );
}
