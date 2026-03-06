import { Overline, SlideTitle, MutedText, AccentBar } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface HookResultProps extends BaseSlideStyleProps {
  result: string
  context: string
  overline?: string
}

export const hookResultDefaultProps: HookResultProps = {
  result: '3시간 → 12분',
  context: '에이전트 도입 후\n하루 리포트 작성 시간',
  overline: 'REAL RESULT',
  ...DEFAULT_COLORS,
}

export function HookResult({ result, context, overline, ...colors }: HookResultProps) {
  const accent = colors.accentColor || '#ff6b35'

  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col justify-center"
        style={{ paddingLeft: spacing.safeX, paddingRight: spacing.safeX, paddingTop: spacing.safeY, paddingBottom: spacing.safeY }}
      >
        {overline && (
          <Overline variant="tag" accentColor={accent} style={{ marginBottom: gap['2xl'] }}>
            {overline}
          </Overline>
        )}

        {/* Big result */}
        <div
          style={{
            fontSize: 120,
            fontWeight: fontWeight.black,
            lineHeight: lineHeight.tight,
            color: accent,
            whiteSpace: 'pre-line' as const,
          }}
        >
          {result}
        </div>

        <AccentBar variant="wide" accentColor={accent} style={{ marginTop: gap['2xl'] }} />

        {/* Context */}
        <MutedText
          size="lg"
          mutedColor={colors.mutedColor || '#a3a3a3'}
          style={{
            marginTop: gap['2xl'],
            fontSize: fontSize.bodyLg,
            fontWeight: fontWeight.medium,
            lineHeight: lineHeight.relaxed,
            whiteSpace: 'pre-line' as const,
          }}
        >
          {context}
        </MutedText>
      </div>
    </SlideBase>
  )
}
