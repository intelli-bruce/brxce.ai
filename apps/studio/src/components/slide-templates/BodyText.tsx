import { SlideTitle, AccentBar, MutedText } from '@/components/slide-primitives'
import { fontSize, fontWeight, lineHeight, spacing, gap } from '@/lib/studio/slide-tokens'
import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface BodyTextProps extends BaseSlideStyleProps {
  heading: string
  body: string
  // Style overrides
  headingFontSize?: number
  bodyFontSize?: number
  showAccentBar?: boolean
  headingBodyGap?: number
  paddingX?: number
}

export const bodyTextDefaultProps: BodyTextProps = {
  heading: '핵심은 정보가 아니라\n전달 순서입니다',
  body: '좋은 캐러셀은 첫 장에서 관심을 끌고, 중간에서 이해를 만들고, 마지막에 행동을 유도합니다. 이 흐름만 지켜도 콘텐츠 성과는 크게 달라집니다.',
  ...DEFAULT_COLORS,
}

function renderMarkdownBold(text: string, accentColor?: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2)
      return (
        <span key={`bold-${idx}`} style={{ fontWeight: fontWeight.bold, color: accentColor }}>
          {content}
        </span>
      )
    }
    return <span key={`text-${idx}`}>{part}</span>
  })
}

export function BodyText({
  heading, body,
  headingFontSize, bodyFontSize, showAccentBar, headingBodyGap, paddingX,
  ...colors
}: BodyTextProps) {
  const px = paddingX ?? spacing.containerMd
  return (
    <SlideBase {...colors}>
      <div
        className="flex h-full flex-col justify-center"
        style={{ paddingLeft: px, paddingRight: px, paddingBottom: spacing.bottomLg, paddingTop: spacing.topMd }}
      >
        {(showAccentBar ?? true) && (
          <AccentBar variant="narrow" accentColor={colors.accentColor} style={{ marginBottom: gap['4xl'] }} />
        )}
        <SlideTitle variant="title" style={headingFontSize != null ? { fontSize: headingFontSize } : undefined}>
          {heading}
        </SlideTitle>
        <MutedText
          size="lg"
          mutedColor={colors.mutedColor}
          style={{ marginTop: headingBodyGap ?? gap['7xl'], fontSize: bodyFontSize ?? fontSize.bodyLg, lineHeight: lineHeight.body }}
        >
          {renderMarkdownBold(body, colors.accentColor)}
        </MutedText>
      </div>
    </SlideBase>
  )
}
