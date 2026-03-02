/**
 * MutedText — Secondary text with muted color, various sizes.
 *
 * Used across nearly all templates for subtitles, descriptions,
 * captions, and secondary information.
 */
import type { CSSProperties, ReactNode } from 'react'
import {
  fontSize,
  fontWeight,
  lineHeight,
  tokenStyle,
  type FontSize,
} from '@/lib/studio/slide-tokens'

export type MutedTextSize = 'lg' | 'md' | 'sm' | 'xs'

const SIZE_MAP: Record<MutedTextSize, CSSProperties> = {
  /** 36–38px body descriptions (BodyText, CoverBold subtitle area) */
  lg: {
    fontSize: fontSize.bodyMd,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
  },
  /** 30–34px captions and secondary text */
  md: {
    fontSize: fontSize.bodySm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.listItem,
  },
  /** 24px small labels (kickers, issue text) */
  sm: {
    fontSize: fontSize.captionMd,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.default,
  },
  /** 20px smallest text (link labels) */
  xs: {
    fontSize: fontSize.captionSm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.default,
  },
} as const

export interface MutedTextProps {
  children: ReactNode
  size?: MutedTextSize
  /** Text color — defaults to mutedColor */
  mutedColor?: string
  style?: CSSProperties
}

const DEFAULT_MUTED = '#a3a3a3'

export function MutedText({
  children,
  size = 'lg',
  mutedColor = DEFAULT_MUTED,
  style,
}: MutedTextProps) {
  return (
    <div
      style={tokenStyle(
        SIZE_MAP[size],
        { color: mutedColor, whiteSpace: 'pre-line' },
        style,
      )}
    >
      {children}
    </div>
  )
}
