import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface BodyCompareProps extends BaseSlideStyleProps {
  title: string
  beforeTitle: string
  beforeDesc?: string
  beforeItems?: string[]
  afterTitle: string
  afterDesc?: string
  afterItems?: string[]
}

export const bodyCompareDefaultProps: BodyCompareProps = {
  title: 'Before / After',
  beforeTitle: 'Before',
  beforeDesc: '감으로 만든 콘텐츠\n성과 예측이 어려움',
  afterTitle: 'After',
  afterDesc: '구조화된 콘텐츠\n전환율과 저장률 개선',
  ...DEFAULT_COLORS,
}

function CompareContent({ desc, items }: { desc?: string; items?: string[] }) {
  if (items?.length) {
    return (
      <ul className="mt-5 space-y-4 text-[34px] leading-relaxed">
        {items.map((item, idx) => (
          <li key={`${item}-${idx}`} className="flex gap-3">
            <span className="mt-2 h-3 w-3 shrink-0 rounded-full bg-current/80" />
            <span className="whitespace-pre-line">{item}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (desc) {
    return <p className="mt-5 whitespace-pre-line text-[36px] leading-relaxed">{desc}</p>
  }

  return null
}

export function BodyCompare({ title, beforeTitle, beforeDesc, beforeItems, afterTitle, afterDesc, afterItems, ...colors }: BodyCompareProps) {
  return (
    <SlideBase {...colors}>
      <div className="flex h-full flex-col justify-center px-16 pb-24 pt-14">
        <h3 className="text-[66px] font-bold">{title}</h3>
        <div className="mt-10 grid grid-cols-2 gap-8">
          <div className="flex min-h-[520px] flex-col justify-center rounded-3xl border border-white/12 bg-white/[0.04] p-10">
            <p className="flex items-center gap-3 text-[42px] font-bold text-white/90">
              <span className="text-[52px] leading-none">❌</span>
              {beforeTitle}
            </p>
            <CompareContent desc={beforeDesc} items={beforeItems} />
          </div>
          <div
            className="flex min-h-[520px] flex-col justify-center rounded-3xl p-10"
            style={{ backgroundColor: `${colors.accentColor}33`, border: `1px solid ${colors.accentColor}99` }}
          >
            <p className="flex items-center gap-3 text-[42px] font-bold" style={{ color: colors.accentColor }}>
              <span className="text-[52px] leading-none">✅</span>
              {afterTitle}
            </p>
            <CompareContent desc={afterDesc} items={afterItems} />
          </div>
        </div>
      </div>
    </SlideBase>
  )
}
