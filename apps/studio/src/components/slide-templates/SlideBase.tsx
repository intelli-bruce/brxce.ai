import type { CSSProperties, ReactNode } from 'react'
import { canvas, spacing } from '@/lib/studio/slide-tokens'

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
      className="relative overflow-hidden"
      style={{ width: canvas.width, height: canvas.height, backgroundColor, color: textColor, ...style }}
    >
      <div className={centerContent ? slideCenteredLayoutClass : 'h-full'}>{children}</div>
      {footer !== 'none' && (
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center"
          style={{ height: spacing.safeY, paddingLeft: spacing.safeX, paddingRight: spacing.safeX }}
        >
          {slideNumber && (
            <span className="text-[24px] tracking-[0.2em] text-white/40">{slideNumber}</span>
          )}
          {footer === 'avatar' && (
            <div className="ml-auto flex items-center gap-4">
              <span className="text-[24px] font-semibold tracking-wide text-white/65">@brxce.ai</span>
              <img src="/bruce-avatar-rounded.png" alt="Bruce" className="h-[52px] w-[52px] rounded-full" />
            </div>
          )}
          {footer === 'minimal' && (
            <span className="ml-auto text-[24px] tracking-[0.38em] text-white/50">@brxce.ai</span>
          )}
        </div>
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
