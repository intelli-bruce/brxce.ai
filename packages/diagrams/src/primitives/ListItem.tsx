/**
 * ListItem — responsive bullet-list rendering. Uses useScale.
 */
"use client";

import { font, bullet, itemText, space, s } from "../tokens";
import { useScale } from "../components/DiagramShell";

type ItemVariant = "default" | "highlight";

interface ListItemProps {
  text: string;
  variant?: ItemVariant;
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
  const { factor } = useScale();

  if (!text) return <div style={{ height: s(space.sm, factor) }} />;

  const { textColor, bulletColor, fontWeight, isIndented } = resolveStyle(text, variant);

  return (
    <div
      style={{
        fontSize: s(isIndented ? font.size.subheading : font.size.body, factor),
        fontWeight,
        color: textColor,
        lineHeight: font.lineHeight.relaxed,
        display: "flex",
        gap: s(bullet.gap, factor),
        alignItems: "flex-start",
        paddingLeft: isIndented ? s(space.lg, factor) : 0,
      }}
    >
      {showBullet && (
        <span
          style={{
            color: bulletColor,
            fontSize: s(bullet.size, factor),
            marginTop: s(bullet.marginTop, factor),
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

/* ─── List ─── */
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
