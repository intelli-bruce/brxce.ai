import { SlideTitle, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap, textOpacity } from '@/lib/studio/slide-tokens'
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
      <div className="flex h-full flex-col justify-center" style={{ padding: spacing.containerLg }}>
        <SlideTitle
          variant="hero"
          style={{ fontSize: fontSize.coverXl, fontWeight: fontWeight.black, lineHeight: lineHeight.tightest }}
        >
          {title}
        </SlideTitle>
        <MutedText size="lg" mutedColor={textOpacity.secondary} style={{ marginTop: gap['4xl'], fontSize: fontSize.bodyMd }}>
          {subtitle}
        </MutedText>
      </div>
    </SlideBase>
  )
}
