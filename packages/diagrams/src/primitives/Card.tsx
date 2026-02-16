/**
 * Card — responsive base container. Uses useScale for proportional sizing.
 */
"use client";

import { card as cardTokens, radius, color, font, space, cardHeader, cardBody, s } from "../tokens";
import { useScale } from "../components/DiagramShell";

export type CardVariant = "default" | "highlight" | "ghost";

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
        borderRadius: s(tokens.borderRadius, factor),
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
  const { factor } = useScale();

  return (
    <div
      style={{
        padding: `${s(cardHeader.padding.y, factor)}px ${s(cardHeader.padding.x, factor)}px ${s(cardHeader.padding.bottom, factor)}px`,
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
