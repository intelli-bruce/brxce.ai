import { Overline, SlideTitle, AccentBar, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap, accentOpacity } from '@/lib/studio/slide-tokens'
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
      <div
        className="flex h-full flex-col items-center justify-center text-center"
        style={{ padding: spacing.containerLg }}
      >
        <Overline variant="kicker" accentColor={colors.accentColor} style={{ marginBottom: gap['4xl'] }}>
          {kicker}
        </Overline>
        <SlideTitle
          variant="hero"
          style={{ fontSize: fontSize.coverLg, fontWeight: fontWeight.bold, lineHeight: lineHeight.default }}
        >
          {title}
        </SlideTitle>
        <AccentBar
          variant="narrow"
          accentColor={colors.accentColor}
          opacity={accentOpacity.full}
          style={{ marginTop: gap['5xl'], marginBottom: gap['5xl'], width: 160, borderRadius: 0, height: 4 }}
        />
        <MutedText size="lg" mutedColor="rgba(255, 255, 255, 0.80)" style={{ fontSize: fontSize.bodyMd }}>
          {subtitle}
        </MutedText>
      </div>
    </SlideBase>
  )
}
