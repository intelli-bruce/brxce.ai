import { Overline, StatDisplay, AccentBar, MutedText } from '@/components/slide-primitives'
import { spacing, gap, layout, textOpacity, accentOpacity } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface HookStatProps extends BaseSlideStyleProps {
  statValue: string
  statLabel: string
  detail: string
  // Style overrides
  statFontSize?: number
  labelFontSize?: number
  detailFontSize?: number
  overlineText?: string
  showOverline?: boolean
  showAccentBar?: boolean
  barWidth?: number
  paddingX?: number
}

export const hookStatDefaultProps: HookStatProps = {
  statValue: '73%',
  statLabel: '저장률 증가',
  detail: '구조화된 캐러셀을 사용한 계정 기준',
  ...DEFAULT_COLORS,
}

export function HookStat({
  statValue, statLabel, detail,
  statFontSize, labelFontSize, detailFontSize,
  overlineText, showOverline, showAccentBar, barWidth, paddingX,
  ...colors
}: HookStatProps) {
  const px = paddingX ?? spacing.safeX
  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col text-center"
        style={{ paddingLeft: px, paddingRight: px, paddingTop: spacing.topMd }}
      >
        {(showOverline ?? true) && (
          <Overline
            variant="badge"
            accentColor={textOpacity.muted}
            style={{
              alignSelf: 'center',
              borderRadius: 24,
              border: `1px solid rgba(255, 255, 255, 0.15)`,
              paddingLeft: spacing.badgeH,
              paddingRight: spacing.badgeH,
              paddingTop: spacing.badgeV,
              paddingBottom: spacing.badgeV,
            }}
          >
            {overlineText ?? 'impact metric'}
          </Overline>
        )}

        <div className="flex flex-1 flex-col items-center justify-center">
          <StatDisplay
            value={statValue}
            label={statLabel}
            accentColor={colors.accentColor}
            valueFontSize={statFontSize}
            labelFontSize={labelFontSize}
          />
        </div>

        <div style={{ paddingBottom: spacing.bottomLg }}>
          {(showAccentBar ?? true) && (
            <AccentBar
              variant="narrow"
              accentColor={colors.accentColor}
              opacity={accentOpacity.mid}
              style={{ width: barWidth ?? 160, height: 3, borderRadius: 9999, marginLeft: 'auto', marginRight: 'auto' }}
            />
          )}
          <MutedText
            size="lg"
            mutedColor={colors.mutedColor}
            style={{ marginTop: gap['3xl'], maxWidth: layout.maxWidth.content, marginLeft: 'auto', marginRight: 'auto', fontSize: detailFontSize ?? 44, lineHeight: 1.625 }}
          >
            {detail}
          </MutedText>
        </div>
      </div>
    </SlideBase>
  )
}
