/**
 * BulletList — List of items with accent-colored dot indicators.
 *
 * Used in HookProblem (md dots, 28px gap) and BodyCompare (sm dots, 16px gap).
 */
import type { CSSProperties } from 'react'
import {
  bullet,
  bulletStyle,
  fontSize,
  fontWeight,
  lineHeight,
  gap,
  tokenStyle,
  type BulletSize,
} from '@/lib/studio/slide-tokens'

export interface BulletListProps {
  items: string[]
  /** Dot size — sm (12px) or md (16px) */
  dotSize?: BulletSize
  /** Dot color */
  accentColor?: string
  /** Item text color */
  textColor?: string
  /** Vertical gap between items in px */
  itemGap?: number
  style?: CSSProperties
}

const DEFAULT_ACCENT = '#ff6b35'
const DEFAULT_TEXT = '#f5f5f5'

export function BulletList({
  items,
  dotSize = 'md',
  accentColor = DEFAULT_ACCENT,
  textColor = DEFAULT_TEXT,
  itemGap = gap['2xl'],
  style,
}: BulletListProps) {
  return (
    <div
      style={tokenStyle(
        {
          display: 'flex',
          flexDirection: 'column',
          gap: itemGap,
        },
        style,
      )}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: gap.lg,
          }}
        >
          <span style={bulletStyle(dotSize, accentColor)} />
          <span
            style={{
              fontSize: fontSize.bodyMd,
              fontWeight: fontWeight.normal,
              lineHeight: lineHeight.listItem,
              color: textColor,
              whiteSpace: 'pre-line',
            }}
          >
            {item}
          </span>
        </div>
      ))}
    </div>
  )
}
