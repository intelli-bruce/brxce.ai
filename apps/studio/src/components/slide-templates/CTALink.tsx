import { Overline, SlideTitle, LinkBox, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface CTALinkProps extends BaseSlideStyleProps {
  title: string
  linkLabel: string
  linkValue: string
  caption: string
}

export const ctaLinkDefaultProps: CTALinkProps = {
  title: '전체 가이드는 프로필 링크에서',
  linkLabel: 'LINK',
  linkValue: 'brxce.ai/studio',
  caption: '프로필 방문 후 무료 템플릿을 받아보세요.',
  ...DEFAULT_COLORS,
}

export function CTALink({ title, linkLabel, linkValue, caption, ...colors }: CTALinkProps) {
  return (
    <SlideBase {...colors}>
      <div className="flex h-full flex-col justify-center" style={{ padding: spacing.containerLg }}>
        <SlideTitle
          variant="title"
          style={{ fontSize: fontSize.ctaMd, fontWeight: fontWeight.bold, lineHeight: lineHeight.default }}
        >
          {title}
        </SlideTitle>
        <div style={{ marginTop: gap['5xl'] }}>
          <Overline variant="linkLabel" accentColor={colors.accentColor}>
            {linkLabel}
          </Overline>
          <LinkBox
            value={linkValue}
            accentColor={colors.accentColor}
            style={{ marginTop: gap.xs }}
          />
        </div>
        <MutedText size="md" mutedColor={colors.mutedColor} style={{ marginTop: gap['4xl'], fontSize: fontSize.captionLg }}>
          {caption}
        </MutedText>
      </div>
    </SlideBase>
  )
}
