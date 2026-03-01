import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface CoverGradientProps extends BaseSlideStyleProps {
  title: string
  subtitle: string
  gradientFrom?: string
  gradientTo?: string
}

export const coverGradientDefaultProps: CoverGradientProps = {
  title: '브랜드를 남기는\n콘텐츠 제작법',
  subtitle: '실전 템플릿 19종 공개',
  gradientFrom: '#1a1a1a',
  gradientTo: '#ff6b35',
  ...DEFAULT_COLORS,
}

export function CoverGradient({ title, subtitle, gradientFrom, gradientTo, ...colors }: CoverGradientProps) {
  return (
    <SlideBase
      {...colors}
      style={{
        background: `radial-gradient(circle at 20% 10%, ${gradientTo}55, transparent 40%), linear-gradient(135deg, ${gradientFrom}, #0a0a0a 70%)`,
      }}
    >
      <div className="flex h-full flex-col justify-center p-20">
        <h1 className="whitespace-pre-line text-[100px] font-black leading-[0.95]">{title}</h1>
        <p className="mt-10 text-4xl text-white/85">{subtitle}</p>
      </div>
    </SlideBase>
  )
}
