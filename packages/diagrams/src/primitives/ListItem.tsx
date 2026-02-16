/**
 * ListItem — consistent bullet-list rendering across all templates.
 *
 * Handles:
 *  - Empty strings → spacer
 *  - ✓ prefix → positive (green)
 *  - ✕ or "X " prefix → negative (dimmed)
 *  - → or × prefix → accent (primary)
 *  - Indented (starts with spaces) → sub-item styling
 *  - Default → normal bullet
 */
import { font, bullet, itemText, space, color as colorTokens } from "../tokens";

type ItemVariant = "default" | "highlight";

interface ListItemProps {
  text: string;
  variant?: ItemVariant;
  /** Show bullet dot */
  showBullet?: boolean;
}

function resolveStyle(text: string, variant: ItemVariant) {
  const isCheck = text.startsWith("✓");
  const isCross = text.startsWith("✕") || /^X\s/.test(text);
  const isAccent = text.startsWith("→") || text.startsWith("×");
  const isIndented = text.startsWith("  ") || text.startsWith("\t");

  let textColor: string;
  let bulletColor: string;
  let fontWeight: number = font.weight.medium;

  if (isCheck) {
    textColor = itemText.positive;
    bulletColor = bullet.color.positive;
  } else if (isCross) {
    textColor = itemText.negative;
    bulletColor = bullet.color.negative;
  } else if (isAccent) {
    textColor = itemText.accent;
    bulletColor = bullet.color.highlight;
    fontWeight = font.weight.semibold;
  } else if (variant === "highlight") {
    textColor = itemText.highlight;
    bulletColor = bullet.color.highlight;
  } else {
    textColor = itemText.default;
    bulletColor = bullet.color.default;
  }

  return { textColor, bulletColor, fontWeight, isIndented };
}

export function ListItem({ text, variant = "default", showBullet = true }: ListItemProps) {
  // Empty string → spacer
  if (!text) return <div style={{ height: space.sm }} />;

  const { textColor, bulletColor, fontWeight, isIndented } = resolveStyle(text, variant);

  return (
    <div
      style={{
        fontSize: isIndented ? font.size.subheading : font.size.body,
        fontWeight,
        color: textColor,
        lineHeight: font.lineHeight.relaxed,
        display: "flex",
        gap: bullet.gap,
        alignItems: "flex-start",
        paddingLeft: isIndented ? space.lg : 0,
      }}
    >
      {showBullet && (
        <span
          style={{
            color: bulletColor,
            fontSize: bullet.size,
            marginTop: bullet.marginTop,
            flexShrink: 0,
          }}
        >
          ●
        </span>
      )}
      <span>{isIndented ? text.trimStart() : text}</span>
    </div>
  );
}

/* ─── Convenience: render a list of items ─── */
interface ListProps {
  items: string[];
  variant?: ItemVariant;
  showBullets?: boolean;
}

export function List({ items, variant = "default", showBullets = true }: ListProps) {
  return (
    <>
      {items.map((item, i) => (
        <ListItem key={i} text={item} variant={variant} showBullet={showBullets} />
      ))}
    </>
  );
}
