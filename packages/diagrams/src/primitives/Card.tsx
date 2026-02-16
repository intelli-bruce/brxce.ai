/**
 * Card — the base container used across all diagram templates.
 *
 * Variants:
 *  - default: dark surface card
 *  - highlight: primary-tinted card (hero/emphasis)
 *  - ghost: borderless transparent
 */
import { card as cardTokens, radius, color, font, space, cardHeader, cardBody } from "../tokens";

export type CardVariant = "default" | "highlight" | "ghost";

interface CardProps {
  variant?: CardVariant;
  /** Optional custom accent color (overrides highlight color) */
  accentColor?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  flex?: number;
}

export function Card({ variant = "default", accentColor, children, style, flex }: CardProps) {
  const tokens = cardTokens[variant];
  const accent = accentColor ?? color.primary;

  // Override highlight tokens with custom accent
  const bg =
    variant === "highlight" && accentColor
      ? `linear-gradient(180deg, ${accent}0A 0%, ${color.bg} 60%)`
      : tokens.background;
  const border =
    variant === "highlight" && accentColor
      ? `1.5px solid ${accent}66`
      : tokens.border;
  const boxShadow =
    variant === "highlight" && accentColor
      ? `0 0 40px ${accent}15, 0 4px 20px rgba(0,0,0,0.4)`
      : tokens.boxShadow;

  return (
    <div
      style={{
        background: bg,
        border,
        borderRadius: tokens.borderRadius,
        boxShadow,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flex,
        ...style,
      }}
    >
      {children}
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

  return (
    <div
      style={{
        padding: cardHeader.padding,
        borderBottom: isHighlight ? `1px solid ${accent}33` : cardHeader.borderBottom.default,
        textAlign: "center",
        background: isHighlight ? `${accent}08` : cardHeader.background.default,
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

  return (
    <div
      style={{
        fontSize: font.size.heading,
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
  return (
    <div style={{ fontSize: font.size.caption, color: color.textMuted, marginTop: space.xs }}>
      {children}
    </div>
  );
}

/* ─── Card.Body ─── */
export function CardBody({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        padding: cardBody.padding,
        display: "flex",
        flexDirection: "column",
        gap: cardBody.gap,
        flex: 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
