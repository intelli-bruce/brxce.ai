import { Overline, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface CoverBeforeAfterProps extends BaseSlideStyleProps {
  beforeText: string
  afterText: string
  tag?: string
  subtitle?: string
}

export const coverBeforeAfterDefaultProps: CoverBeforeAfterProps = {
  beforeText: '매일 3시간\n반복 작업',
  afterText: '에이전트가\n대신 처리',
  tag: 'BEFORE → AFTER',
  subtitle: '스와이프해서 변화를 확인하세요',
  ...DEFAULT_COLORS,
}

export function CoverBeforeAfter({ beforeText, afterText, tag, subtitle, ...colors }: CoverBeforeAfterProps) {
  const accent = colors.accentColor || '#ff6b35'
  const muted = colors.mutedColor || '#a3a3a3'

  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col justify-center"
        style={{ paddingLeft: spacing.safeX, paddingRight: spacing.safeX, paddingTop: spacing.safeY, paddingBottom: spacing.safeY }}
      >
        {tag && (
          <Overline variant="tag" accentColor={accent} style={{ marginBottom: gap['3xl'] }}>
            {tag}
          </Overline>
        )}

        {/* Split layout */}
        <div style={{ display: 'flex', gap: gap.xl, flex: 0 }}>
          {/* Before half */}
          <div
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 20,
              padding: `${gap['3xl']}px ${gap['2xl']}px`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderTop: `4px solid ${muted}40`,
            }}
          >
            <span style={{ fontSize: fontSize.captionLg, fontWeight: fontWeight.bold, color: muted, letterSpacing: '0.15em', marginBottom: gap.xl }}>
              BEFORE
            </span>
            <div style={{ fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold, lineHeight: lineHeight.relaxed, color: muted, whiteSpace: 'pre-line' as const }}>
              {beforeText}
            </div>
          </div>

          {/* After half */}
          <div
            style={{
              flex: 1,
              backgroundColor: `${accent}10`,
              borderRadius: 20,
              padding: `${gap['3xl']}px ${gap['2xl']}px`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderTop: `4px solid ${accent}`,
            }}
          >
            <span style={{ fontSize: fontSize.captionLg, fontWeight: fontWeight.bold, color: accent, letterSpacing: '0.15em', marginBottom: gap.xl }}>
              AFTER
            </span>
            <div style={{ fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold, lineHeight: lineHeight.relaxed, color: colors.textColor || '#f5f5f5', whiteSpace: 'pre-line' as const }}>
              {afterText}
            </div>
          </div>
        </div>

        {subtitle && (
          <MutedText size="md" mutedColor={muted} style={{ marginTop: gap['3xl'], fontSize: fontSize.bodySm, textAlign: 'center' as const }}>
            {subtitle}
          </MutedText>
        )}
      </div>
    </SlideBase>
  )
}
