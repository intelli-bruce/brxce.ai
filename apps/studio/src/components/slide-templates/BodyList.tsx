import { SlideTitle, AccentBar, NumberBadge, SlideCard, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap, accentOpacity } from '@/lib/studio/slide-tokens'
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
      <div
        className="flex h-full flex-col justify-center"
        style={{ paddingLeft: spacing.containerMd, paddingRight: spacing.containerMd, paddingBottom: spacing.bottomLg, paddingTop: spacing.topMd }}
      >
        <SlideTitle variant="title">
          {title}
        </SlideTitle>
        <AccentBar
          variant="narrow"
          accentColor={colors.accentColor}
          opacity={accentOpacity.muted}
          style={{ marginTop: gap['4xl'] }}
        />
        <div style={{ marginTop: gap['5xl'], display: 'flex', flexDirection: 'column', gap: gap['3xl'] }}>
          {items.map((item, idx) => (
            <SlideCard
              key={item + idx}
              variant="listItem"
              style={{ display: 'flex', alignItems: 'flex-start', gap: gap.xl, paddingLeft: spacing.cardSmH, paddingRight: spacing.cardSmH, paddingTop: spacing.cardSmV, paddingBottom: spacing.cardSmV }}
            >
              <NumberBadge size="sm" accentColor={colors.accentColor}>
                {idx + 1}
              </NumberBadge>
              <MutedText
                size="md"
                mutedColor={colors.textColor}
                style={{ flex: 1, fontSize: fontSize.bodyMd, fontWeight: fontWeight.normal, lineHeight: lineHeight.listItem }}
              >
                {item}
              </MutedText>
            </SlideCard>
          ))}
        </div>
      </div>
    </SlideBase>
  )
}
