import { Overline, SlideTitle, AccentBar, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap, cardBackground } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface CoverNumberedProps extends BaseSlideStyleProps {
  number: string
  title: string
  subtitle: string
  tag?: string
}

export const coverNumberedDefaultProps: CoverNumberedProps = {
  number: '7',
  title: '에이전트 활용법',
  subtitle: '지금 바로 적용할 수 있는\n실전 팁 모음',
  tag: 'GUIDE',
  ...DEFAULT_COLORS,
}

export function CoverNumbered({ number, title, subtitle, tag, ...colors }: CoverNumberedProps) {
  const accent = colors.accentColor || '#ff6b35'

  return (
    <SlideBase {...colors}>
      <div className="absolute inset-0">
        <div
          className="h-full w-full"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,107,53,0.16), transparent 50%), linear-gradient(140deg, #101114 0%, #17191f 55%, #0f0f10 100%)',
          }}
        />
      </div>
      <div className="absolute inset-0" style={{ backgroundColor: cardBackground.overlay }} />
      <div
        className="relative z-10 flex h-full flex-col justify-center"
        style={{ paddingLeft: spacing.safeX, paddingRight: spacing.safeX, paddingTop: spacing.safeY, paddingBottom: spacing.safeY }}
      >
        {tag && (
          <Overline variant="tag" accentColor={accent} style={{ marginBottom: gap.xl }}>
            {tag}
          </Overline>
        )}

        {/* Big number + title inline */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: gap.xl }}>
          <span style={{ fontSize: 220, fontWeight: fontWeight.black, lineHeight: '0.8', color: accent }}>
            {number}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: fontSize.coverCompact, fontWeight: fontWeight.black, lineHeight: lineHeight.tight, color: colors.textColor || '#f5f5f5', whiteSpace: 'pre-line' as const }}>
              {title}
            </div>
          </div>
        </div>

        <AccentBar variant="wide" accentColor={accent} style={{ marginTop: gap['2xl'] }} />

        <MutedText
          size="lg"
          mutedColor={colors.textColor || '#f5f5f5'}
          style={{
            marginTop: gap['2xl'],
            fontSize: fontSize.subtitleLg,
            fontWeight: fontWeight.medium,
            lineHeight: lineHeight.subtitle,
            color: 'rgba(255,255,255,0.85)',
            whiteSpace: 'pre-line' as const,
          }}
        >
          {subtitle}
        </MutedText>
      </div>
    </SlideBase>
  )
}
