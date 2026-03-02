import { Overline, StatDisplay, AccentBar, MutedText } from '@/components/slide-primitives'
import { spacing, gap, layout, textOpacity, accentOpacity } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface HookStatProps extends BaseSlideStyleProps {
  statValue: string
  statLabel: string
  detail: string
}

export const hookStatDefaultProps: HookStatProps = {
  statValue: '73%',
  statLabel: '저장률 증가',
  detail: '구조화된 캐러셀을 사용한 계정 기준',
  ...DEFAULT_COLORS,
}

export function HookStat({ statValue, statLabel, detail, ...colors }: HookStatProps) {
  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col text-center"
        style={{ paddingLeft: spacing.containerMd, paddingRight: spacing.containerMd, paddingTop: spacing.topMd }}
      >
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
          impact metric
        </Overline>

        <div className="flex flex-1 flex-col items-center justify-center">
          <StatDisplay
            value={statValue}
            label={statLabel}
            accentColor={colors.accentColor}
          />
        </div>

        <div style={{ paddingBottom: spacing.bottomLg }}>
          <AccentBar
            variant="narrow"
            accentColor={colors.accentColor}
            opacity={accentOpacity.mid}
            style={{ width: 160, height: 3, borderRadius: 9999, marginLeft: 'auto', marginRight: 'auto' }}
          />
          <MutedText
            size="lg"
            mutedColor={colors.mutedColor}
            style={{ marginTop: gap['3xl'], maxWidth: layout.maxWidth.content, marginLeft: 'auto', marginRight: 'auto', fontSize: 44, lineHeight: 1.625 }}
          >
            {detail}
          </MutedText>
        </div>
      </div>
    </SlideBase>
  )
}
