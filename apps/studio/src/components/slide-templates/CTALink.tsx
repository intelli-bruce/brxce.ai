import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface CTALinkProps extends BaseSlideStyleProps {
  title: string
  linkLabel: string
  linkValue: string
  caption: string
}

export const ctaLinkDefaultProps: CTALinkProps = {
  title: '전체 가이드는 프로필 링크에서',
  linkLabel: 'LINK',
  linkValue: 'brxce.ai/studio',
  caption: '프로필 방문 후 무료 템플릿을 받아보세요.',
  ...DEFAULT_COLORS,
}

export function CTALink({ title, linkLabel, linkValue, caption, ...colors }: CTALinkProps) {
  return (
    <SlideBase {...colors}>
      <div className="flex h-full flex-col justify-center p-20">
        <h3 className="text-[72px] font-bold leading-tight">{title}</h3>
        <div className="mt-12 rounded-2xl border px-8 py-6" style={{ borderColor: colors.accentColor }}>
          <p className="text-xl tracking-[0.25em]" style={{ color: colors.accentColor }}>{linkLabel}</p>
          <p className="mt-2 text-5xl font-semibold">{linkValue}</p>
        </div>
        <p className="mt-10 text-3xl" style={{ color: colors.mutedColor }}>{caption}</p>
      </div>
    </SlideBase>
  )
}
