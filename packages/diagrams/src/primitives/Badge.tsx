"use client";

import { color, font, space, radius, s } from "../tokens";
import { useScale } from "../components/DiagramShell";

interface BadgeProps {
  children: React.ReactNode;
  accentColor?: string;
  variant?: "filled" | "outline";
}

export function Badge({ children, accentColor, variant = "outline" }: BadgeProps) {
  const { factor } = useScale();
  const accent = accentColor ?? color.primary;
  const isFilled = variant === "filled";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: s(space.xs, factor),
        fontSize: s(font.size.tiny, factor),
        fontWeight: font.weight.semibold,
        letterSpacing: font.letterSpacing.wide,
        textTransform: "uppercase",
        color: isFilled ? color.bg : accent,
        background: isFilled ? accent : `${accent}15`,
        border: isFilled ? "none" : `1px solid ${accent}44`,
        borderRadius: radius.pill,
        padding: `${s(2, factor)}px ${s(space.sm, factor)}px`,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}
