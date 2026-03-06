import { SlideTitle, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface HookRoadmapProps extends BaseSlideStyleProps {
  title: string
  items: string[]
  subtitle?: string
}

export const hookRoadmapDefaultProps: HookRoadmapProps = {
  title: '이 캐러셀에서\n배울 것',
  items: ['문제 진단법', '3단계 해결 프로세스', '실전 템플릿', '바로 적용하는 체크리스트'],
  subtitle: '스와이프해서 확인하세요 →',
  ...DEFAULT_COLORS,
}

export function HookRoadmap({ title, items, subtitle, ...colors }: HookRoadmapProps) {
  const accent = colors.accentColor || '#ff6b35'

  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col justify-center"
        style={{ paddingLeft: spacing.safeX, paddingRight: spacing.safeX, paddingTop: spacing.safeY, paddingBottom: spacing.safeY }}
      >
        <SlideTitle variant="title" style={{ fontSize: fontSize.headingLg, fontWeight: fontWeight.bold, lineHeight: lineHeight.default }}>
          {title}
        </SlideTitle>

        <div style={{ marginTop: gap['3xl'], display: 'flex', flexDirection: 'column', gap: gap.xl }}>
          {items.map((item, idx) => (
            <div key={`rm-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: gap.lg }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  minWidth: 44,
                  borderRadius: 12,
                  backgroundColor: `${accent}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: fontSize.bodyXs,
                  fontWeight: fontWeight.bold,
                  color: accent,
                }}
              >
                {idx + 1}
              </div>
              <MutedText size="lg" mutedColor={colors.textColor || '#f5f5f5'} style={{ fontSize: fontSize.bodyMd, fontWeight: fontWeight.medium, lineHeight: lineHeight.default }}>
                {item}
              </MutedText>
            </div>
          ))}
        </div>

        {subtitle && (
          <MutedText size="md" mutedColor={accent} style={{ marginTop: gap['4xl'], fontSize: fontSize.captionLg, fontWeight: fontWeight.semibold, letterSpacing: '0.05em' }}>
            {subtitle}
          </MutedText>
        )}
      </div>
    </SlideBase>
  )
}
