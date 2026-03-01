import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface CoverCenteredProps extends BaseSlideStyleProps {
  title: string
  subtitle: string
  kicker: string
}

export const coverCenteredDefaultProps: CoverCenteredProps = {
  title: '매출을 높이는\n콘텐츠 구조',
  subtitle: '핵심만 담은 5분 가이드',
  kicker: 'INSTAGRAM CAROUSEL',
  ...DEFAULT_COLORS,
}

export function CoverCentered({ title, subtitle, kicker, ...colors }: CoverCenteredProps) {
  return (
    <SlideBase {...colors}>
      <div className="flex h-full flex-col items-center justify-center p-20 text-center">
        <p className="mb-10 text-2xl tracking-[0.3em]" style={{ color: colors.accentColor }}>{kicker}</p>
        <h1 className="whitespace-pre-line text-[98px] font-bold leading-tight">{title}</h1>
        <div className="my-12 h-1 w-40" style={{ backgroundColor: colors.accentColor }} />
        <p className="text-4xl text-white/80">{subtitle}</p>
      </div>
    </SlideBase>
  )
}
