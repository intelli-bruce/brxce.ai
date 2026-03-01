import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface BodyListProps extends BaseSlideStyleProps {
  title: string
  items: string[]
}

export const bodyListDefaultProps: BodyListProps = {
  title: '성과를 높이는 4가지 기준',
  items: ['첫 장에서 문제를 명확히 제시', '한 슬라이드에는 한 메시지만', '숫자/사례로 신뢰 확보', '마지막 슬라이드에서 CTA 제시'],
  ...DEFAULT_COLORS,
}

export function BodyList({ title, items, ...colors }: BodyListProps) {
  return (
    <SlideBase {...colors}>
      <div className="flex h-full flex-col justify-center px-16 pb-24 pt-14">
        <h3 className="text-[62px] font-bold leading-tight">{title}</h3>
        <div className="mt-10 h-[4px] w-28 rounded-full" style={{ backgroundColor: `${colors.accentColor}c7` }} />
        <div className="mt-12 space-y-8">
          {items.map((item, idx) => (
            <div key={item + idx} className="flex items-start gap-6 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[30px] font-black text-white"
                style={{ backgroundColor: colors.accentColor }}
              >
                {idx + 1}
              </span>
              <p className="flex-1 whitespace-pre-line text-[36px] leading-[1.35]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  )
}
