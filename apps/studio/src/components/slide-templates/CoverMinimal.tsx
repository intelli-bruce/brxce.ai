import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface CoverMinimalProps extends BaseSlideStyleProps {
  title: string
  subtitle: string
  issue: string
}

export const coverMinimalDefaultProps: CoverMinimalProps = {
  title: '좋은 콘텐츠는\n구조에서 시작됩니다',
  subtitle: '작지만 강한 차이를 만드는 프레임워크',
  issue: 'NO. 19',
  ...DEFAULT_COLORS,
}

export function CoverMinimal({ title, subtitle, issue, ...colors }: CoverMinimalProps) {
  return (
    <SlideBase {...colors}>
      <div className="flex h-full flex-col justify-between p-20">
        <p className="text-2xl" style={{ color: colors.mutedColor }}>{issue}</p>
        <div className="space-y-10 pb-28">
          <h1 className="whitespace-pre-line text-[86px] font-semibold leading-tight">{title}</h1>
          <p className="max-w-[760px] text-4xl" style={{ color: colors.mutedColor }}>{subtitle}</p>
          <div className="h-1 w-36" style={{ backgroundColor: colors.accentColor }} />
        </div>
      </div>
    </SlideBase>
  )
}
