import { DEFAULT_COLORS, ImagePlaceholder, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface CoverSplitProps extends BaseSlideStyleProps {
  title: string
  subtitle: string
  imageUrl?: string
}

export const coverSplitDefaultProps: CoverSplitProps = {
  title: '데이터로 보는\n콘텐츠 성장법',
  subtitle: '감이 아닌 기준으로 운영하세요',
  imageUrl: undefined,
  ...DEFAULT_COLORS,
}

export function CoverSplit({ title, subtitle, imageUrl, ...colors }: CoverSplitProps) {
  return (
    <SlideBase {...colors}>
      <div className="grid h-full grid-cols-2">
        <div className="h-full">
          {imageUrl ? <img src={imageUrl} alt={title} className="h-full w-full object-cover" /> : <ImagePlaceholder label="좌측 이미지" />}
        </div>
        <div className="flex flex-col justify-center p-16">
          <div className="mb-8 h-2 w-24" style={{ backgroundColor: colors.accentColor }} />
          <h1 className="whitespace-pre-line text-[78px] font-bold leading-tight">{title}</h1>
          <p className="mt-8 text-4xl" style={{ color: colors.mutedColor }}>{subtitle}</p>
        </div>
      </div>
    </SlideBase>
  )
}
