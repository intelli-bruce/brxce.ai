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
      <div className="p-20">
        <h3 className="text-[66px] font-bold">{title}</h3>
        <div className="mt-24 flex items-center justify-between gap-3">
          {nodes.map((node, idx) => (
            <div key={node + idx} className="flex items-center gap-3">
              <div className="rounded-xl border border-white/15 px-6 py-5 text-center text-3xl min-w-[180px]">{node}</div>
              {idx < nodes.length - 1 && <div className="text-4xl" style={{ color: colors.accentColor }}>→</div>}
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  )
}
