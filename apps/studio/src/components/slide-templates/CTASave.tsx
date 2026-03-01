import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface CTASaveProps extends BaseSlideStyleProps {
  title: string
  subtitle: string
  tip: string
}

export const ctaSaveDefaultProps: CTASaveProps = {
  title: '나중에 바로 쓰려면\n지금 저장하세요',
  subtitle: '저장해두면 다음 콘텐츠 제작이 10배 빨라집니다.',
  tip: '우측 상단 ••• 버튼 > 저장',
  ...DEFAULT_COLORS,
}

export function CTASave({ title, subtitle, tip, ...colors }: CTASaveProps) {
  return (
    <SlideBase {...colors}>
      <div className="flex h-full flex-col justify-center p-20">
        <h3 className="whitespace-pre-line text-[84px] font-black leading-tight">{title}</h3>
        <p className="mt-10 text-4xl text-white/85">{subtitle}</p>
        <p className="mt-10 text-3xl" style={{ color: colors.accentColor }}>{tip}</p>
      </div>
    </SlideBase>
  )
}
