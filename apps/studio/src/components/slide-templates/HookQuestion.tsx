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
      <div className="flex h-full flex-col items-center justify-center px-16 py-20 text-center">
        <h2 className="max-w-[900px] whitespace-pre-line text-[96px] font-extrabold leading-tight">{question}</h2>
        <p className="mt-20 text-[44px]" style={{ color: colors.accentColor }}>
          {subQuestion}
        </p>
      </div>
    </SlideBase>
  )
}
