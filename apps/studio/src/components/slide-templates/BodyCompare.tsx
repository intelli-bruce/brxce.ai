import { renderMarkdownBold } from '@/lib/studio/render-markdown'
import { SlideTitle, SlideCard, BulletList } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap, layout, textOpacity, accentOpacity } from '@/lib/studio/slide-tokens'
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

function CompareContent({ desc, items, accentColor, textColor }: { desc?: string; items?: string[]; accentColor: string; textColor: string }) {
  if (items?.length) {
    return (
      <BulletList
        items={items}
        dotSize="sm"
        accentColor="currentColor"
        textColor={textColor}
        itemGap={gap.md}
        style={{ marginTop: gap.lg, fontSize: fontSize.bodySm, lineHeight: lineHeight.relaxed }}
      />
    )
  }

  if (desc) {
    return (
      <div style={{ marginTop: gap.lg, whiteSpace: 'pre-line', fontSize: fontSize.bodyMd, lineHeight: lineHeight.relaxed }}>
        {desc}
      </div>
    )
  }

  return null
}

export function BodyCompare({ title, beforeTitle, beforeDesc, beforeItems, afterTitle, afterDesc, afterItems, ...colors }: BodyCompareProps) {
  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col justify-center"
        style={{ paddingLeft: spacing.safeX, paddingRight: spacing.safeX, paddingBottom: spacing.bottomLg, paddingTop: spacing.topMd }}
      >
        <SlideTitle variant="title" style={{ fontSize: fontSize.headingLg }}>
          {renderMarkdownBold(title, colors.accentColor)}
        </SlideTitle>
        <div style={{ marginTop: gap['4xl'], display: 'grid', gridTemplateColumns: '1fr 1fr', gap: gap['3xl'] }}>
          <SlideCard
            variant="compareCard"
            style={{ display: 'flex', minHeight: layout.minHeight.compareCard, flexDirection: 'column', justifyContent: 'center', padding: spacing.cardLg }}
          >
            <p style={{ display: 'flex', alignItems: 'center', gap: gap.sm, fontSize: fontSize.cardLabel, fontWeight: fontWeight.bold, color: textOpacity.primary }}>
              <span style={{ fontSize: fontSize.emojiLg, lineHeight: lineHeight.none }}>❌</span>
              {beforeTitle}
            </p>
            <CompareContent desc={beforeDesc} items={beforeItems} accentColor={colors.accentColor ?? ''} textColor={colors.textColor ?? ''} />
          </SlideCard>
          <div
            style={{
              display: 'flex',
              minHeight: layout.minHeight.compareCard,
              flexDirection: 'column',
              justifyContent: 'center',
              padding: spacing.cardLg,
              backgroundColor: `${colors.accentColor}${accentOpacity.bgLight}`,
              border: `1px solid ${colors.accentColor}${accentOpacity.light}`,
              borderRadius: 24,
            }}
          >
            <p style={{ display: 'flex', alignItems: 'center', gap: gap.sm, fontSize: fontSize.cardLabel, fontWeight: fontWeight.bold, color: colors.accentColor }}>
              <span style={{ fontSize: fontSize.emojiLg, lineHeight: lineHeight.none }}>✅</span>
              {afterTitle}
            </p>
            <CompareContent desc={afterDesc} items={afterItems} accentColor={colors.accentColor ?? ''} textColor={colors.textColor ?? ''} />
          </div>
        </div>
      </div>
    </SlideBase>
  )
}
