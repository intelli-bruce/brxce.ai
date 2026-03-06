import { renderMarkdownBold } from '@/lib/studio/render-markdown'
import { SlideTitle, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface BodyChecklistProps extends BaseSlideStyleProps {
  title: string
  items: string[]
  /** checked 상태 배열 (true=체크, false=미체크). 기본값: 전부 체크 */
  checked?: boolean[]
}

export const bodyChecklistDefaultProps: BodyChecklistProps = {
  title: '런칭 전 체크리스트',
  items: [
    '타겟 고객 정의 완료',
    '랜딩 페이지 A/B 테스트',
    '결제 플로우 QA 통과',
    '이메일 시퀀스 세팅',
    'SNS 콘텐츠 5일치 예약',
  ],
  checked: [true, true, true, false, false],
  ...DEFAULT_COLORS,
}

export function BodyChecklist({ title, items, checked, ...colors }: BodyChecklistProps) {
  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col justify-center"
        style={{ paddingLeft: spacing.safeX, paddingRight: spacing.safeX, paddingTop: spacing.safeY, paddingBottom: spacing.safeY }}
      >
        <SlideTitle variant="title" style={{ fontSize: fontSize.headingLg, fontWeight: fontWeight.bold, lineHeight: lineHeight.default }}>
          {renderMarkdownBold(title, colors.accentColor)}
        </SlideTitle>

        <div style={{ marginTop: gap['3xl'], display: 'flex', flexDirection: 'column', gap: gap.xl }}>
          {items.map((item, idx) => {
            const isChecked = checked?.[idx] ?? true
            return (
              <div
                key={`check-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: gap.lg,
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    minWidth: 48,
                    borderRadius: 10,
                    border: isChecked ? 'none' : `3px solid ${colors.mutedColor || '#a3a3a3'}66`,
                    backgroundColor: isChecked ? (colors.accentColor || '#ff6b35') : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isChecked && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                {/* Label */}
                <MutedText
                  size="lg"
                  mutedColor={isChecked ? (colors.textColor || '#f5f5f5') : (colors.mutedColor || '#a3a3a3')}
                  style={{
                    fontSize: fontSize.bodyMd,
                    fontWeight: isChecked ? fontWeight.semibold : fontWeight.normal,
                    lineHeight: lineHeight.default,
                    textDecoration: isChecked ? 'none' : 'none',
                  }}
                >
                  {item}
                </MutedText>
              </div>
            )
          })}
        </div>
      </div>
    </SlideBase>
  )
}
