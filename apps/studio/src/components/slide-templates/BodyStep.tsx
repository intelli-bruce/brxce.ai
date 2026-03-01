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
      <div className="flex h-full flex-col px-16 pb-24 pt-14">
        <h3 className="text-[62px] font-bold">{title}</h3>
        <div className="mt-8 flex flex-1 flex-col justify-between gap-6">
          {normalizedSteps.map((step, idx) => (
            <div key={step.title + idx} className="flex items-center gap-6 rounded-3xl border border-white/12 bg-white/[0.04] px-8 py-7">
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-4xl font-black text-white"
                style={{ backgroundColor: colors.accentColor }}
              >
                {idx + 1}
              </div>
              <div>
                <p className="text-[46px] font-semibold leading-tight">{step.title}</p>
                <p className="mt-2 text-[32px] leading-relaxed" style={{ color: colors.mutedColor }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  )
}
