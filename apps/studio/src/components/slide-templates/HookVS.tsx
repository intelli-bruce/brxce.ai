import { AccentBar } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap, layout, accentOpacity, textOpacity } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface HookVSProps extends BaseSlideStyleProps {
  topLabel: string
  bottomLabel: string
  vsText?: string
  // Style overrides
  labelFontSize?: number
  vsFontSize?: number
  showAccentBar?: boolean
  barWidth?: number
  paddingX?: number
}

export const hookVSDefaultProps: HookVSProps = {
  topLabel: '제로샷',
  bottomLabel: '에이전틱 워크플로우',
  ...DEFAULT_COLORS,
}

export function HookVS({
  topLabel, bottomLabel, vsText,
  labelFontSize, vsFontSize, showAccentBar, barWidth, paddingX,
  ...colors
}: HookVSProps) {
  const px = paddingX ?? spacing.safeX
  const lblSize = labelFontSize ?? fontSize.hookXl
  const vsSize = vsFontSize ?? fontSize.displayXl

  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col items-center justify-center text-center"
        style={{ paddingLeft: px, paddingRight: px, paddingTop: spacing.safeY, paddingBottom: spacing.safeY }}
      >
        {/* Top label */}
        <p style={{
          fontSize: lblSize,
          fontWeight: fontWeight.bold,
          lineHeight: lineHeight.default,
          color: textOpacity.primary,
          maxWidth: layout.maxWidth.content,
        }}>
          {topLabel}
        </p>

        {/* VS hero */}
        <div style={{ marginTop: gap['5xl'], marginBottom: gap['5xl'], display: 'flex', flexDirection: 'column', alignItems: 'center', gap: gap.lg }}>
          {(showAccentBar ?? true) && (
            <AccentBar
              variant="narrow"
              accentColor={colors.accentColor}
              opacity={accentOpacity.mid}
              style={{ width: barWidth ?? 120, height: 3, borderRadius: 9999 }}
            />
          )}
          <p style={{
            fontSize: vsSize,
            fontWeight: fontWeight.black,
            lineHeight: lineHeight.none,
            color: colors.accentColor,
          }}>
            {vsText ?? 'VS'}
          </p>
          {(showAccentBar ?? true) && (
            <AccentBar
              variant="narrow"
              accentColor={colors.accentColor}
              opacity={accentOpacity.mid}
              style={{ width: barWidth ?? 120, height: 3, borderRadius: 9999 }}
            />
          )}
        </div>

        {/* Bottom label */}
        <p style={{
          fontSize: lblSize,
          fontWeight: fontWeight.bold,
          lineHeight: lineHeight.default,
          color: textOpacity.primary,
          maxWidth: layout.maxWidth.content,
        }}>
          {bottomLabel}
        </p>
      </div>
    </SlideBase>
  )
}
