import { SlideTitle, BulletList } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface HookProblemProps extends BaseSlideStyleProps {
  title: string
  points: string[]
}

export const hookProblemDefaultProps: HookProblemProps = {
  title: '이런 문제가 반복되나요?',
  points: ['조회수는 나오는데 전환이 없다', '업로드는 하는데 브랜딩이 약하다', '소재를 매번 처음부터 고민한다'],
  ...DEFAULT_COLORS,
}

export function HookProblem({ title, points, ...colors }: HookProblemProps) {
  return (
    <SlideBase {...colors}>
      <div style={{ padding: spacing.containerLg }}>
        <SlideTitle
          variant="title"
          style={{ fontSize: fontSize.hookMd, fontWeight: fontWeight.bold, lineHeight: lineHeight.default }}
        >
          {title}
        </SlideTitle>
        <BulletList
          items={points}
          dotSize="md"
          accentColor={colors.accentColor}
          itemGap={gap['2xl']}
          style={{ marginTop: gap['6xl'] }}
        />
      </div>
    </SlideBase>
  )
}
