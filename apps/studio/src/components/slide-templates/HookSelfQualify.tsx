import { SlideTitle, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface HookSelfQualifyProps extends BaseSlideStyleProps {
  title: string
  conditions: string[]
  conclusion?: string
}

export const hookSelfQualifyDefaultProps: HookSelfQualifyProps = {
  title: '이런 분이라면\n이 캐러셀은 당신을\n위한 것입니다',
  conditions: [
    'AI 도구를 써봤지만 성과가 없다',
    '혼자서 여러 업무를 동시에 처리해야 한다',
    '시스템을 만들고 싶은데 어디서부터 할지 모른다',
  ],
  conclusion: '하나라도 해당되면 → 스와이프',
  ...DEFAULT_COLORS,
}

export function HookSelfQualify({ title, conditions, conclusion, ...colors }: HookSelfQualifyProps) {
  const accent = colors.accentColor || '#ff6b35'

  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col justify-center"
        style={{ paddingLeft: spacing.safeX, paddingRight: spacing.safeX, paddingTop: spacing.safeY, paddingBottom: spacing.safeY }}
      >
        <SlideTitle variant="title" style={{ fontSize: fontSize.hookMd, fontWeight: fontWeight.bold, lineHeight: lineHeight.default }}>
          {title}
        </SlideTitle>

        <div style={{ marginTop: gap['3xl'], display: 'flex', flexDirection: 'column', gap: gap.xl }}>
          {conditions.map((cond, idx) => (
            <div key={`sq-${idx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: gap.lg }}>
              <span style={{ fontSize: 28, lineHeight: 1, minWidth: 36, textAlign: 'center' as const }}>
                ☑️
              </span>
              <MutedText size="lg" mutedColor={colors.textColor || '#f5f5f5'} style={{ fontSize: fontSize.bodyMd, fontWeight: fontWeight.medium, lineHeight: lineHeight.relaxed }}>
                {cond}
              </MutedText>
            </div>
          ))}
        </div>

        {conclusion && (
          <div
            style={{
              marginTop: gap['4xl'],
              backgroundColor: `${accent}15`,
              borderRadius: 16,
              padding: `${gap.lg}px ${gap.xl}px`,
              textAlign: 'center' as const,
            }}
          >
            <MutedText size="lg" mutedColor={accent} style={{ fontSize: fontSize.bodySm, fontWeight: fontWeight.bold }}>
              {conclusion}
            </MutedText>
          </div>
        )}
      </div>
    </SlideBase>
  )
}
