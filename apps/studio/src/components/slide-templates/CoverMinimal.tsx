import { SlideTitle, AccentBar, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap, layout, accentOpacity } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface CoverMinimalProps extends BaseSlideStyleProps {
  title: string
  subtitle: string
  issue: string
}

export const coverMinimalDefaultProps: CoverMinimalProps = {
  title: '좋은 콘텐츠는\n구조에서 시작됩니다',
  subtitle: '작지만 강한 차이를 만드는 프레임워크',
  issue: 'NO. 19',
  ...DEFAULT_COLORS,
}

export function CoverMinimal({ title, subtitle, issue, ...colors }: CoverMinimalProps) {
  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col justify-between"
        style={{ padding: spacing.containerLg }}
      >
        <MutedText size="sm" mutedColor={colors.mutedColor}>
          {issue}
        </MutedText>
        <div style={{ paddingBottom: spacing.bottomXl }}>
          <div className="space-y-10">
            <SlideTitle
              variant="hero"
              style={{ fontSize: fontSize.coverSm, fontWeight: fontWeight.semibold, lineHeight: lineHeight.default }}
            >
              {title}
            </SlideTitle>
            <MutedText size="lg" mutedColor={colors.mutedColor} style={{ maxWidth: layout.maxWidth.subtitle, fontSize: fontSize.bodyMd }}>
              {subtitle}
            </MutedText>
            <AccentBar
              variant="narrow"
              accentColor={colors.accentColor}
              opacity={accentOpacity.full}
              style={{ width: 144, borderRadius: 0, height: 4 }}
            />
          </div>
        </div>
      </div>
    </SlideBase>
  )
}
