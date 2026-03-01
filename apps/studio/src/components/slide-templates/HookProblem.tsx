import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface HookProblemProps extends BaseSlideStyleProps {
  title: string
  points: string[]
}

export const hookProblemDefaultProps: HookProblemProps = {
  title: '이런 문제가 반복되나요?',
  points: ['조회수는 나오는데 전환이 없다', '업로드는 하는데 브랜딩이 약하다', '소재를 매번 처음부터 고민한다'],
  ...DEFAULT_COLORS,
}

export function HookProblem({ title, points, ...colors }: HookProblemProps) {
  return (
    <SlideBase {...colors}>
      <div className="p-20">
        <h2 className="text-[82px] font-bold leading-tight">{title}</h2>
        <div className="mt-14 space-y-7">
          {points.map((point, i) => (
            <div key={point + i} className="flex items-start gap-5 text-4xl">
              <span className="mt-2 block h-4 w-4 rounded-full" style={{ backgroundColor: colors.accentColor }} />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  )
}
