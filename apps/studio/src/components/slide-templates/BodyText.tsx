import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface BodyTextProps extends BaseSlideStyleProps {
  heading: string
  body: string
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
        <span key={`bold-${idx}`} className="font-bold" style={{ color: accentColor }}>
          {content}
        </span>
      )
    }
    return <span key={`text-${idx}`}>{part}</span>
  })
}

export function BodyText({ heading, body, ...colors }: BodyTextProps) {
  return (
    <SlideBase {...colors}>
      <div className="flex h-full flex-col justify-center px-16 pb-24 pt-14">
        <div className="mb-10 h-[4px] w-28 rounded-full" style={{ backgroundColor: `${colors.accentColor}cc` }} />
        <h3 className="whitespace-pre-line text-[62px] font-bold leading-tight">{heading}</h3>
        <p className="mt-16 whitespace-pre-line text-[38px] leading-[1.7]" style={{ color: colors.mutedColor }}>
          {renderMarkdownBold(body, colors.accentColor)}
        </p>
      </div>
    </SlideBase>
  )
}
