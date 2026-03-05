import { SlideCard, QuoteBlock } from '@/components/slide-primitives'
import { spacing } from '@/lib/studio/slide-tokens'
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
      <div
        className="flex h-full flex-col justify-center"
        style={{ paddingLeft: spacing.safeX, paddingRight: spacing.safeX, paddingTop: spacing.safeY, paddingBottom: spacing.safeY }}
      >
        <SlideCard
          variant="quoteCard"
          style={{ paddingLeft: spacing.quoteH, paddingRight: spacing.quoteH, paddingTop: spacing.quoteV, paddingBottom: spacing.quoteV }}
        >
          <QuoteBlock
            text={quote}
            author={author || 'BRXCE.AI'}
            accentColor={colors.accentColor}
            mutedColor={colors.mutedColor}
          />
        </SlideCard>
      </div>
    </SlideBase>
  )
}
