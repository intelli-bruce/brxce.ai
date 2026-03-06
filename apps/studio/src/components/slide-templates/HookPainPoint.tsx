import { SlideTitle, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface HookPainPointProps extends BaseSlideStyleProps {
  painPoint: string
  empathy: string
  transition?: string
}

export const hookPainPointDefaultProps: HookPainPointProps = {
  painPoint: '매일 같은 작업을\n반복하고 있다면',
  empathy: '당신 잘못이 아닙니다.\n시스템이 없는 게 문제입니다.',
  transition: '해결법은 생각보다 간단합니다 →',
  ...DEFAULT_COLORS,
}

export function HookPainPoint({ painPoint, empathy, transition, ...colors }: HookPainPointProps) {
  const accent = colors.accentColor || '#ff6b35'
  const muted = colors.mutedColor || '#a3a3a3'

  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col justify-center"
        style={{ paddingLeft: spacing.safeX, paddingRight: spacing.safeX, paddingTop: spacing.safeY, paddingBottom: spacing.safeY }}
      >
        {/* Pain point - big emotional text */}
        <div
          style={{
            fontSize: fontSize.hookMd,
            fontWeight: fontWeight.bold,
            lineHeight: lineHeight.default,
            color: colors.textColor || '#f5f5f5',
            whiteSpace: 'pre-line' as const,
          }}
        >
          {painPoint}
        </div>

        {/* Empathy line */}
        <div
          style={{
            marginTop: gap['3xl'],
            borderLeft: `4px solid ${accent}`,
            paddingLeft: gap.xl,
          }}
        >
          <MutedText
            size="lg"
            mutedColor={muted}
            style={{
              fontSize: fontSize.bodyMd,
              fontWeight: fontWeight.medium,
              lineHeight: lineHeight.relaxed,
              whiteSpace: 'pre-line' as const,
            }}
          >
            {empathy}
          </MutedText>
        </div>

        {/* Transition CTA */}
        {transition && (
          <MutedText
            size="md"
            mutedColor={accent}
            style={{
              marginTop: gap['4xl'],
              fontSize: fontSize.bodySm,
              fontWeight: fontWeight.semibold,
            }}
          >
            {transition}
          </MutedText>
        )}
      </div>
    </SlideBase>
  )
}
