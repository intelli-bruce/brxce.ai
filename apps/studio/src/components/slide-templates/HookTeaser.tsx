import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface HookTeaserProps extends BaseSlideStyleProps {
  overline: string
  title: string
  teaser: string
}

export const hookTeaserDefaultProps: HookTeaserProps = {
  overline: '잠깐, 다음 슬라이드에서',
  title: '조회수보다 중요한\n전환 구조를 공개합니다',
  teaser: '끝까지 보면 바로 적용할 수 있어요.',
  ...DEFAULT_COLORS,
}

export function HookTeaser({ overline, title, teaser, ...colors }: HookTeaserProps) {
  return (
    <SlideBase {...colors}>
      <div className="flex h-full flex-col justify-center p-20">
        <p className="text-3xl" style={{ color: colors.accentColor }}>{overline}</p>
        <h2 className="mt-8 whitespace-pre-line text-[90px] font-bold leading-tight">{title}</h2>
        <p className="mt-12 text-4xl text-white/80">{teaser}</p>
      </div>
    </SlideBase>
  )
}
