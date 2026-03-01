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
  const titleClass = lineCount >= 3 ? 'text-[80px] leading-[1.02]' : 'text-[94px] leading-[0.98]'

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
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex h-full flex-col justify-center px-16 py-16">
        <p className="mb-8 text-[38px] font-semibold tracking-[0.04em]" style={{ color: colors.accentColor }}>
          {tag}
        </p>
        <h1 className={`whitespace-pre-line font-black ${titleClass}`}>{title}</h1>
        <div className="mt-8 h-[4px] w-44 rounded-full" style={{ backgroundColor: `${colors.accentColor}cc` }} />
        <p className="mt-8 whitespace-pre-line text-[56px] font-medium leading-[1.3] text-white/98">{subtitle}</p>
      </div>
    </SlideBase>
  )
}
