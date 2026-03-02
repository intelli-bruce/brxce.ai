/**
 * NumberBadge — Circular numbered indicator.
 *
 * Used in BodyList (sm: 56px) and BodyStep (lg: 96px).
 */
import type { CSSProperties, ReactNode } from 'react'
import {
  numberBadgeStyle,
  tokenStyle,
  type NumberBadgeSize,
} from '@/lib/studio/slide-tokens'

export interface NumberBadgeProps {
  children: ReactNode
  /** Badge size — sm (56px) or lg (96px) */
  size?: NumberBadgeSize
  /** Background color */
  accentColor?: string
  /** Text color — defaults to white */
  textColor?: string
  style?: CSSProperties
}

const DEFAULT_ACCENT = '#ff6b35'

export function NumberBadge({
  children,
  size = 'sm',
  accentColor = DEFAULT_ACCENT,
  textColor = '#ffffff',
  style,
}: NumberBadgeProps) {
  return (
    <div
      style={tokenStyle(
        numberBadgeStyle(size, accentColor),
        { color: textColor },
        style,
      )}
    >
      {children}
    </div>
  )
}
