import { SlideTitle, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap, layout } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface HookQuestionProps extends BaseSlideStyleProps {
  question: string
  subQuestion: string
}

export const hookQuestionDefaultProps: HookQuestionProps = {
  question: '아직도 콘텐츠를\n감으로 만들고 계신가요?',
  subQuestion: '이제는 구조가 필요합니다.',
  ...DEFAULT_COLORS,
}

export function HookQuestion({ question, subQuestion, ...colors }: HookQuestionProps) {
  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col items-center justify-center text-center"
        style={{ paddingLeft: spacing.safeX, paddingRight: spacing.safeX, paddingTop: spacing.safeY, paddingBottom: spacing.safeY }}
      >
        <SlideTitle
          variant="hero"
          style={{ fontSize: fontSize.hookXl, fontWeight: fontWeight.extrabold, lineHeight: lineHeight.default, maxWidth: layout.maxWidth.content }}
        >
          {question}
        </SlideTitle>
        <MutedText
          size="lg"
          mutedColor={colors.accentColor}
          style={{ marginTop: gap['8xl'], fontSize: fontSize.subHeading }}
        >
          {subQuestion}
        </MutedText>
      </div>
    </SlideBase>
  )
}
