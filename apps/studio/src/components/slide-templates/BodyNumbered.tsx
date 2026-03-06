import { MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface BodyNumberedProps extends BaseSlideStyleProps {
  number: string
  title: string
  body: string
  totalLabel?: string
}

export const bodyNumberedDefaultProps: BodyNumberedProps = {
  number: '03',
  title: '하나의 슬라이드에\n하나의 포인트만',
  body: '정보가 많으면 전달력이 떨어집니다.\n슬라이드당 핵심 메시지 하나에 집중하세요.\n나머지는 다음 장에서.',
  totalLabel: '/07',
  ...DEFAULT_COLORS,
}

function renderMarkdownBold(text: string, accentColor?: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={`b-${idx}`} style={{ fontWeight: fontWeight.bold, color: accentColor }}>
          {part.slice(2, -2)}
        </span>
      )
    }
    return <span key={`t-${idx}`}>{part}</span>
  })
}

export function BodyNumbered({ number, title, body, totalLabel, ...colors }: BodyNumberedProps) {
  const accent = colors.accentColor || '#ff6b35'

  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col justify-center"
        style={{ paddingLeft: spacing.safeX, paddingRight: spacing.safeX, paddingTop: spacing.safeY, paddingBottom: spacing.safeY }}
      >
        {/* Big number */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 160, fontWeight: fontWeight.black, lineHeight: '0.85', color: accent }}>
            {number}
          </span>
          {totalLabel && (
            <span style={{ fontSize: fontSize.subtitleLg, fontWeight: fontWeight.bold, color: `${accent}50` }}>
              {totalLabel}
            </span>
          )}
        </div>

        {/* Title */}
        <div style={{ marginTop: gap['2xl'], fontSize: fontSize.headingLg, fontWeight: fontWeight.bold, lineHeight: lineHeight.default, color: colors.textColor || '#f5f5f5', whiteSpace: 'pre-line' as const }}>
          {title}
        </div>

        {/* Body */}
        <MutedText size="lg" mutedColor={colors.mutedColor || '#a3a3a3'} style={{ marginTop: gap.xl, fontSize: fontSize.bodyMd, lineHeight: lineHeight.relaxed, whiteSpace: 'pre-line' as const }}>
          {renderMarkdownBold(body, accent)}
        </MutedText>
      </div>
    </SlideBase>
  )
}
