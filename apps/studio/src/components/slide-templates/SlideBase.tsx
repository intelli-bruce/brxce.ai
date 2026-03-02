import type { CSSProperties, ReactNode } from 'react'

export interface BaseSlideStyleProps {
  backgroundColor?: string
  accentColor?: string
  textColor?: string
  mutedColor?: string
  slideNumber?: string
}

export const DEFAULT_COLORS = {
  backgroundColor: '#0a0a0a',
  accentColor: '#ff6b35',
  textColor: '#f5f5f5',
  mutedColor: '#a3a3a3',
}

export const slideCenteredLayoutClass = 'flex h-full flex-col justify-center'

export type FooterVariant = 'avatar' | 'minimal' | 'none'

export function SlideBase({
  children,
  backgroundColor = DEFAULT_COLORS.backgroundColor,
  textColor = DEFAULT_COLORS.textColor,
  slideNumber,
  style,
  centerContent = false,
  footer = 'avatar',
}: BaseSlideStyleProps & {
  children: ReactNode
  style?: CSSProperties
  centerContent?: boolean
  footer?: FooterVariant
}) {
  return (
    <div
      className="relative h-[1350px] w-[1080px] overflow-hidden"
      style={{ backgroundColor, color: textColor, ...style }}
    >
      <div className={centerContent ? slideCenteredLayoutClass : 'h-full'}>{children}</div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      {footer === 'avatar' && (
        <div className="absolute bottom-8 left-16 flex items-center gap-5">
          <img
            src="/bruce-avatar-rounded.png"
            alt="Bruce"
            className="h-[64px] w-[64px] rounded-full"
          />
          <span className="text-[26px] font-semibold tracking-wide text-white/70">@brxce.ai</span>
        </div>
      )}
      {footer === 'minimal' && (
        <div className="absolute bottom-10 left-16 text-[28px] tracking-[0.38em] text-white/50">@brxce.ai</div>
      )}
      {footer !== 'none' && slideNumber && (
        <div className="absolute bottom-10 right-12 text-[28px] tracking-[0.2em] text-white/40">{slideNumber}</div>
      )}
    </div>
  )
}

export function ImagePlaceholder({ label = '이미지 영역' }: { label?: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center border border-dashed border-white/30 bg-white/5 text-3xl text-white/60">
      {label}
    </div>
  )
}
