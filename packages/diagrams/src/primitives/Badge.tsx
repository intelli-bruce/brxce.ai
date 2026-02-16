/**
 * Badge — small pill/tag labels for node types, statuses, etc.
 */
import { color, font, space, radius } from "../tokens";

interface BadgeProps {
  children: React.ReactNode;
  /** Accent color for the badge */
  accentColor?: string;
  /** Filled vs outline */
  variant?: "filled" | "outline";
}

export function Badge({ children, accentColor, variant = "outline" }: BadgeProps) {
  const accent = accentColor ?? color.primary;
  const isFilled = variant === "filled";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: space.xs,
        fontSize: font.size.tiny,
        fontWeight: font.weight.semibold,
        letterSpacing: font.letterSpacing.wide,
        textTransform: "uppercase",
        color: isFilled ? color.bg : accent,
        background: isFilled ? accent : `${accent}15`,
        border: isFilled ? "none" : `1px solid ${accent}44`,
        borderRadius: radius.pill,
        padding: `2px ${space.sm}px`,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}
