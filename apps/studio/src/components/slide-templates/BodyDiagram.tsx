import { SlideTitle, DiagramFlow } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface BodyDiagramProps extends BaseSlideStyleProps {
  title: string
  nodes: string[]
}

export const bodyDiagramDefaultProps: BodyDiagramProps = {
  title: '콘텐츠 전환 플로우',
  nodes: ['문제 제기', '해결 아이디어', '실행 방법', 'CTA'],
  ...DEFAULT_COLORS,
}

export function BodyDiagram({ title, nodes, ...colors }: BodyDiagramProps) {
  return (
    <SlideBase {...colors}>
      <div style={{ padding: spacing.containerLg }}>
        <SlideTitle variant="title" style={{ fontSize: fontSize.headingLg, fontWeight: fontWeight.bold }}>
          {title}
        </SlideTitle>
        <DiagramFlow
          nodes={nodes}
          accentColor={colors.accentColor}
          style={{ marginTop: gap['9xl'], justifyContent: 'space-between' }}
        />
      </div>
    </SlideBase>
  )
}
