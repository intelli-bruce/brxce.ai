import { Overline, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface HookListPreviewProps extends BaseSlideStyleProps {
  title: string
  items: string[]
  /** 몇 번째까지 보여주고 나머지는 블러 처리 */
  revealCount?: number
  overline?: string
}

export const hookListPreviewDefaultProps: HookListPreviewProps = {
  title: '생산성 10배\n올리는 5가지 습관',
  items: ['아침 루틴 자동화', '에이전트 위임 체계', '주간 회고 시스템', '비동기 커뮤니케이션', '지식 DB 구축'],
  revealCount: 2,
  overline: '5 HABITS',
  ...DEFAULT_COLORS,
}

export function HookListPreview({ title, items, revealCount = 2, overline, ...colors }: HookListPreviewProps) {
  const accent = colors.accentColor || '#ff6b35'
  const muted = colors.mutedColor || '#a3a3a3'

  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col justify-center"
        style={{ paddingLeft: spacing.safeX, paddingRight: spacing.safeX, paddingTop: spacing.safeY, paddingBottom: spacing.safeY }}
      >
        {overline && (
          <Overline variant="tag" accentColor={accent} style={{ marginBottom: gap['2xl'] }}>
            {overline}
          </Overline>
        )}

        <div
          style={{
            fontSize: fontSize.headingLg,
            fontWeight: fontWeight.bold,
            lineHeight: lineHeight.default,
            color: colors.textColor || '#f5f5f5',
            whiteSpace: 'pre-line' as const,
          }}
        >
          {title}
        </div>

        <div style={{ marginTop: gap['3xl'], display: 'flex', flexDirection: 'column', gap: gap.lg }}>
          {items.map((item, idx) => {
            const isRevealed = idx < revealCount
            return (
              <div
                key={`lp-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: gap.lg,
                  opacity: isRevealed ? 1 : 0.25,
                  filter: isRevealed ? 'none' : 'blur(4px)',
                }}
              >
                <span
                  style={{
                    fontSize: fontSize.bodyXs,
                    fontWeight: fontWeight.bold,
                    color: isRevealed ? accent : muted,
                    minWidth: 36,
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <MutedText
                  size="lg"
                  mutedColor={isRevealed ? (colors.textColor || '#f5f5f5') : muted}
                  style={{
                    fontSize: fontSize.bodyMd,
                    fontWeight: isRevealed ? fontWeight.semibold : fontWeight.normal,
                    lineHeight: lineHeight.default,
                  }}
                >
                  {item}
                </MutedText>
              </div>
            )
          })}
        </div>

        <MutedText size="md" mutedColor={accent} style={{ marginTop: gap['2xl'], fontSize: fontSize.captionLg, fontWeight: fontWeight.semibold }}>
          스와이프해서 전부 확인하세요 →
        </MutedText>
      </div>
    </SlideBase>
  )
}
