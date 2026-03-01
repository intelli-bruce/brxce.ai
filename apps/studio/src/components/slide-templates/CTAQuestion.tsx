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
      <div className="flex h-full flex-col items-center justify-center p-20 text-center">
        <h3 className="whitespace-pre-line text-[74px] font-bold leading-tight">{question}</h3>
        <p className="mt-10 text-3xl text-white/80">{guide}</p>
        <p className="mt-12 text-4xl font-semibold" style={{ color: colors.accentColor }}>{prompt}</p>
      </div>
    </SlideBase>
  )
}
