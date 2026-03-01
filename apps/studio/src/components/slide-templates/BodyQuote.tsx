import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface BodyQuoteProps extends BaseSlideStyleProps {
  quote: string
  author: string
}

export const bodyQuoteDefaultProps: BodyQuoteProps = {
  quote: '좋은 콘텐츠는 더 많은 정보를 주는 것이 아니라,\n더 빠르게 이해되게 만드는 것입니다.',
  author: 'BRXCE.AI Team',
  ...DEFAULT_COLORS,
}

export function BodyQuote({ quote, author, ...colors }: BodyQuoteProps) {
  return (
    <SlideBase {...colors}>
      <div className="flex h-full flex-col justify-center px-16 py-14">
        <div className="relative rounded-[36px] border border-white/12 bg-white/[0.04] px-14 py-16">
          <p className="pointer-events-none absolute -left-4 -top-14 text-[190px] font-black leading-none" style={{ color: `${colors.accentColor}dd` }}>
            “
          </p>
          <p className="whitespace-pre-line text-[56px] font-semibold leading-[1.23]">{quote}</p>
          <p className="pointer-events-none absolute -bottom-24 right-8 text-[190px] font-black leading-none" style={{ color: `${colors.accentColor}dd` }}>
            ”
          </p>
        </div>
        <p className="mt-14 text-right text-3xl" style={{ color: colors.mutedColor }}>
          — {author || 'BRXCE.AI'}
        </p>
      </div>
    </SlideBase>
  )
}
