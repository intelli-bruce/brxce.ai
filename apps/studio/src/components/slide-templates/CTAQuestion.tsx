import { SlideTitle, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap, textOpacity } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface CTAQuestionProps extends BaseSlideStyleProps {
  question: string
  guide: string
  prompt: string
}

export const ctaQuestionDefaultProps: CTAQuestionProps = {
  question: '여러분의 콘텐츠 제작\n가장 큰 고민은 무엇인가요?',
  guide: '댓글로 남겨주시면 다음 템플릿에서 다뤄드릴게요.',
  prompt: '#댓글로_고민_남기기',
  ...DEFAULT_COLORS,
}

export function CTAQuestion({ question, guide, prompt, ...colors }: CTAQuestionProps) {
  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col items-center justify-center text-center"
        style={{ padding: spacing.containerLg }}
      >
        <SlideTitle
          variant="title"
          style={{ fontSize: fontSize.ctaLg, fontWeight: fontWeight.bold, lineHeight: lineHeight.default }}
        >
          {question}
        </SlideTitle>
        <MutedText size="md" mutedColor={textOpacity.tertiary} style={{ marginTop: gap['4xl'], fontSize: fontSize.captionLg }}>
          {guide}
        </MutedText>
        <MutedText
          size="lg"
          mutedColor={colors.accentColor}
          style={{ marginTop: gap['5xl'], fontSize: fontSize.bodyMd, fontWeight: fontWeight.semibold }}
        >
          {prompt}
        </MutedText>
      </div>
    </SlideBase>
  )
}
