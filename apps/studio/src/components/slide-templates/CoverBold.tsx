import { Overline, SlideTitle, AccentBar, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap, cardBackground } from '@/lib/studio/slide-tokens'
import type { ReactNode } from 'react'

function renderHighlight(text: string, accentColor?: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={`hl-${idx}`} style={{ color: accentColor }}>
          {part.slice(2, -2)}
        </span>
      )
    }
    return <span key={`t-${idx}`}>{part}</span>
  })
}
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface CoverBoldProps extends BaseSlideStyleProps {
  title: string
  subtitle: string
  tag: string
  backgroundImageUrl?: string
}

export const coverBoldDefaultProps: CoverBoldProps = {
  title: '결과를 만드는\n콘텐츠 전략',
  subtitle: '실무에서 바로 쓰는 인스타 캐러셀 설계법',
  tag: 'BRXCE STUDIO',
  backgroundImageUrl: undefined,
  ...DEFAULT_COLORS,
}

export function CoverBold({ title, subtitle, tag, backgroundImageUrl, ...colors }: CoverBoldProps) {
  const lineCount = title.split('\n').length
  const titleFontSize = lineCount >= 3 ? fontSize.coverCompact : fontSize.coverMd
  const titleLineHeight = lineCount >= 3 ? lineHeight.tight : lineHeight.tighter

  return (
    <SlideBase {...colors}>
      <div className="absolute inset-0">
        {backgroundImageUrl ? (
          <img src={backgroundImageUrl} alt={title} className="h-full w-full object-cover opacity-40" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,107,53,0.16), transparent 50%), linear-gradient(140deg, #101114 0%, #17191f 55%, #0f0f10 100%)',
            }}
          />
        )}
      </div>
      <div className="absolute inset-0" style={{ backgroundColor: cardBackground.overlay }} />
      <div
        className="relative z-10 flex h-full flex-col justify-center"
        style={{ paddingLeft: spacing.containerMd, paddingRight: spacing.containerMd, paddingTop: spacing.containerMd, paddingBottom: spacing.containerMd }}
      >
        <Overline variant="tag" accentColor={colors.accentColor} style={{ marginBottom: gap['3xl'] }}>
          {tag}
        </Overline>
        <SlideTitle
          variant="hero"
          style={{ fontSize: titleFontSize, lineHeight: titleLineHeight, fontWeight: fontWeight.black }}
        >
          {title.includes('**') ? renderHighlight(title, colors.accentColor) : title}
        </SlideTitle>
        <AccentBar variant="wide" accentColor={colors.accentColor} style={{ marginTop: gap['3xl'] }} />
        <MutedText
          size="lg"
          mutedColor={colors.textColor}
          style={{
            marginTop: gap['3xl'],
            fontSize: fontSize.subtitleLg,
            fontWeight: fontWeight.medium,
            lineHeight: lineHeight.subtitle,
            color: 'rgba(255, 255, 255, 0.98)',
          }}
        >
          {subtitle}
        </MutedText>
      </div>
    </SlideBase>
  )
}
