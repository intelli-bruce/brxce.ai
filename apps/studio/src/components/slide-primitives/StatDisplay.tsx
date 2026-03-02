/**
 * StatDisplay — Large hero number with a label beneath.
 *
 * Matches HookStat: 220px font-black stat value in accent color,
 * 64px semibold label, optional detail text below.
 */
import type { CSSProperties } from 'react'
import {
  fontSize,
  fontWeight,
  lineHeight,
  tokenStyle,
} from '@/lib/studio/slide-tokens'

export interface StatDisplayProps {
  /** The hero number/stat (e.g. "73%") */
  value: string
  /** Label below the stat */
  label: string
  accentColor?: string
  textColor?: string
  mutedColor?: string
  style?: CSSProperties
}

const DEFAULT_ACCENT = '#ff6b35'
const DEFAULT_TEXT = '#f5f5f5'
const DEFAULT_MUTED = '#a3a3a3'

export function StatDisplay({
  value,
  label,
  accentColor = DEFAULT_ACCENT,
  textColor = DEFAULT_TEXT,
  mutedColor = DEFAULT_MUTED,
  style,
}: StatDisplayProps) {
  return (
    <div
      style={tokenStyle(
        {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
        style,
      )}
    >
      {/* Hero stat value */}
      <div
        style={{
          fontSize: fontSize.displayXl,
          fontWeight: fontWeight.black,
          lineHeight: lineHeight.none,
          color: accentColor,
        }}
      >
        {value}
      </div>

      {/* Stat label */}
      <div
        style={{
          fontSize: fontSize.headingSm,
          fontWeight: fontWeight.semibold,
          lineHeight: lineHeight.default,
          color: textColor,
          marginTop: 16,
        }}
      >
        {label}
      </div>
    </div>
  )
}
