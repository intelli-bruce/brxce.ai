/**
 * QuoteBlock — Large decorative quotation marks wrapping text.
 *
 * Matches BodyQuote: 190px font-black quote marks at accent color,
 * 56px semibold quote text, optional author attribution.
 */
import type { CSSProperties } from 'react'
import {
  fontSize,
  fontWeight,
  lineHeight,
  accentOpacity,
  tokenStyle,
} from '@/lib/studio/slide-tokens'

export interface QuoteBlockProps {
  /** The quoted text */
  text: string
  /** Attribution line (rendered with em-dash prefix) */
  author?: string
  accentColor?: string
  textColor?: string
  mutedColor?: string
  style?: CSSProperties
}

const DEFAULT_ACCENT = '#ff6b35'
const DEFAULT_TEXT = '#f5f5f5'
const DEFAULT_MUTED = '#a3a3a3'

const MARK_STYLE: CSSProperties = {
  fontSize: fontSize.displayLg,
  fontWeight: fontWeight.black,
  lineHeight: lineHeight.none,
  position: 'absolute',
}

export function QuoteBlock({
  text,
  author,
  accentColor = DEFAULT_ACCENT,
  textColor = DEFAULT_TEXT,
  mutedColor = DEFAULT_MUTED,
  style,
}: QuoteBlockProps) {
  const markColor = `${accentColor}${accentOpacity.text}`

  return (
    <div style={tokenStyle({ position: 'relative' }, style)}>
      {/* Opening quote mark */}
      <div
        style={tokenStyle(MARK_STYLE, {
          color: markColor,
          left: -16,
          top: -56,
        })}
      >
        {'\u201C'}
      </div>

      {/* Quote text */}
      <div
        style={{
          fontSize: fontSize.subtitleLg,
          fontWeight: fontWeight.semibold,
          lineHeight: lineHeight.quote,
          color: textColor,
          whiteSpace: 'pre-line',
        }}
      >
        {text}
      </div>

      {/* Closing quote mark */}
      <div
        style={tokenStyle(MARK_STYLE, {
          color: markColor,
          right: 32,
          bottom: -96,
        })}
      >
        {'\u201D'}
      </div>

      {/* Author */}
      {author && (
        <div
          style={{
            fontSize: fontSize.captionLg,
            color: mutedColor,
            textAlign: 'right',
            marginTop: 56,
          }}
        >
          {`\u2014 ${author}`}
        </div>
      )}
    </div>
  )
}
