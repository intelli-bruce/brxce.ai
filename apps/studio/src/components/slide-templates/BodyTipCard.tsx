import { MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface BodyTipCardProps extends BaseSlideStyleProps {
  emoji: string
  title: string
  body: string
  tipNumber?: string
}

export const bodyTipCardDefaultProps: BodyTipCardProps = {
  emoji: '💡',
  title: '프롬프트는 구체적으로',
  body: '"좋은 코드 짜줘"보다\n"TypeScript로 JWT 인증 미들웨어 작성해줘.\nExpress 5, 에러 핸들링 포함."\n\n구체적일수록 결과가 정확합니다.',
  tipNumber: 'TIP 03',
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

export function BodyTipCard({ emoji, title, body, tipNumber, ...colors }: BodyTipCardProps) {
  const accent = colors.accentColor || '#ff6b35'

  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col justify-center"
        style={{ paddingLeft: spacing.safeX, paddingRight: spacing.safeX, paddingTop: spacing.safeY, paddingBottom: spacing.safeY }}
      >
        {/* Tip label */}
        {tipNumber && (
          <span style={{ fontSize: fontSize.captionLg, fontWeight: fontWeight.bold, color: accent, letterSpacing: '0.2em', marginBottom: gap['2xl'] }}>
            {tipNumber}
          </span>
        )}

        {/* Emoji */}
        <div style={{ fontSize: 80, lineHeight: 1, marginBottom: gap['2xl'] }}>
          {emoji}
        </div>

        {/* Title */}
        <div style={{ fontSize: fontSize.headingLg, fontWeight: fontWeight.bold, lineHeight: lineHeight.default, color: colors.textColor || '#f5f5f5', whiteSpace: 'pre-line' as const }}>
          {title}
        </div>

        {/* Body */}
        <MutedText size="lg" mutedColor={colors.mutedColor || '#a3a3a3'} style={{ marginTop: gap.xl, fontSize: fontSize.bodySm, lineHeight: lineHeight.relaxed, whiteSpace: 'pre-line' as const }}>
          {renderMarkdownBold(body, accent)}
        </MutedText>
      </div>
    </SlideBase>
  )
}
