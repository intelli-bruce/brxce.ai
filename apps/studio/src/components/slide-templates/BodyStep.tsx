import { SlideTitle, NumberBadge, SlideCard, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface BodyStepProps extends BaseSlideStyleProps {
  title: string
  steps: ({ title: string; desc: string } | string)[]
}

export const bodyStepDefaultProps: BodyStepProps = {
  title: '3단계 제작 프로세스',
  steps: [
    { title: 'Hook', desc: '문제/질문으로 관심 확보' },
    { title: 'Proof', desc: '데이터/사례로 신뢰 형성' },
    { title: 'CTA', desc: '저장/팔로우/댓글 행동 유도' },
  ],
  ...DEFAULT_COLORS,
}

export function BodyStep({ title, steps, ...colors }: BodyStepProps) {
  const normalizedSteps = steps.map((step) => (typeof step === 'string' ? { title: step, desc: '' } : step))

  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col"
        style={{ paddingLeft: spacing.containerMd, paddingRight: spacing.containerMd, paddingBottom: spacing.bottomLg, paddingTop: spacing.topMd }}
      >
        <SlideTitle variant="title">
          {title}
        </SlideTitle>
        <div style={{ marginTop: gap['3xl'], display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between', gap: gap.xl }}>
          {normalizedSteps.map((step, idx) => (
            <SlideCard
              key={step.title + idx}
              variant="stepCard"
              style={{ display: 'flex', alignItems: 'center', gap: gap.xl, paddingLeft: spacing.cardMdH, paddingRight: spacing.cardMdH, paddingTop: spacing.cardMdV, paddingBottom: spacing.cardMdV }}
            >
              <NumberBadge size="lg" accentColor={colors.accentColor}>
                {idx + 1}
              </NumberBadge>
              <div>
                <MutedText
                  size="lg"
                  mutedColor={colors.textColor}
                  style={{ fontSize: fontSize.cardTitle, fontWeight: fontWeight.semibold, lineHeight: lineHeight.default }}
                >
                  {step.title}
                </MutedText>
                <MutedText
                  size="md"
                  mutedColor={colors.mutedColor}
                  style={{ marginTop: gap.xs, fontSize: fontSize.bodyXs, lineHeight: lineHeight.relaxed }}
                >
                  {step.desc}
                </MutedText>
              </div>
            </SlideCard>
          ))}
        </div>
      </div>
    </SlideBase>
  )
}
