import { SlideTitle, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, gap, spacing, textOpacity } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

function renderMarkdownBold(text: string, accentColor?: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2)
      return (
        <span key={`bold-${idx}`} style={{ fontWeight: fontWeight.bold, color: accentColor }}>
          {content}
        </span>
      )
    }
    return <span key={`text-${idx}`}>{part}</span>
  })
}

export interface CTAQuestionProps extends BaseSlideStyleProps {
  question: string
  guide: string
  prompt: string
  // Style overrides
  questionFontSize?: number
  guideFontSize?: number
  promptFontSize?: number
  padding?: number
}

export const ctaQuestionDefaultProps: CTAQuestionProps = {
  question: '여러분의 콘텐츠 제작\n가장 큰 고민은 무엇인가요?',
  guide: '댓글로 남겨주시면 다음 템플릿에서 다뤄드릴게요.',
  prompt: '#댓글로_고민_남기기',
  ...DEFAULT_COLORS,
}

export function CTAQuestion({
  question, guide, prompt,
  questionFontSize, guideFontSize, promptFontSize, padding: paddingOverride,
  ...colors
}: CTAQuestionProps) {
  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col items-center justify-center text-center"
        style={{ paddingLeft: spacing.safeX, paddingRight: spacing.safeX, paddingTop: spacing.safeY, paddingBottom: spacing.safeY }}
      >
        <SlideTitle
          variant="title"
          style={{ fontSize: questionFontSize ?? fontSize.ctaLg, fontWeight: fontWeight.bold, lineHeight: lineHeight.default }}
        >
          {renderMarkdownBold(question, colors.accentColor)}
        </SlideTitle>
        <MutedText size="md" mutedColor={textOpacity.tertiary} style={{ marginTop: gap['4xl'], fontSize: guideFontSize ?? fontSize.captionLg }}>
          {renderMarkdownBold(guide, colors.accentColor)}
        </MutedText>
        <MutedText
          size="lg"
          mutedColor={colors.accentColor}
          style={{ marginTop: gap['5xl'], fontSize: promptFontSize ?? fontSize.bodyMd, fontWeight: fontWeight.semibold }}
        >
          {prompt}
        </MutedText>
      </div>
    </SlideBase>
  )
}
