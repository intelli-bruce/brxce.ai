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
import { renderMarkdownBold } from '@/lib/studio/render-markdown'

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

export function QuoteBlock({
  text,
  author,
  accentColor = DEFAULT_ACCENT,
  textColor = DEFAULT_TEXT,
  mutedColor = DEFAULT_MUTED,
  style,
}: QuoteBlockProps) {
  const markColor = `${accentColor}${accentOpacity.text}`

  const markStyle: CSSProperties = {
    fontSize: fontSize.displayLg,
    fontWeight: fontWeight.black,
    lineHeight: '0.5',
    color: markColor,
    height: 100,
    overflow: 'visible',
  }

  return (
    <div style={tokenStyle({ position: 'relative' }, style)}>
      {/* Opening mark — above text, left aligned */}
      <div style={markStyle}>
        {'\u201C'}
      </div>

      {/* Quote text */}
      <div
        style={{
          fontSize: fontSize.bodyMd,
          fontWeight: fontWeight.medium,
          lineHeight: lineHeight.relaxed,
          color: textColor,
          whiteSpace: 'pre-line',
        }}
      >
        {renderMarkdownBold(text, accentColor)}
      </div>

      {/* Closing mark — below text, right aligned */}
      <div style={{ ...markStyle, textAlign: 'right' }}>
        {'\u201D'}
      </div>

      {/* Author */}
      {author && (
        <div
          style={{
            fontSize: fontSize.captionLg,
            color: mutedColor,
            textAlign: 'right',
            marginTop: 24,
          }}
        >
          {`\u2014 ${author}`}
        </div>
      )}
    </div>
  )
}
