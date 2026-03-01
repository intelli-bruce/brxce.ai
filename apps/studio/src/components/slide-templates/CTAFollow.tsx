import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface CTAFollowProps extends BaseSlideStyleProps {
  title: string
  handle: string
  reason: string
  hintText?: string
}

export const ctaFollowDefaultProps: CTAFollowProps = {
  title: '실전 템플릿이 더 필요하다면?',
  handle: '@brxce.ai',
  reason: '팔로우하고 매주 새로운 템플릿을 받아보세요.',
  hintText: '↑ 프로필에서 팔로우',
  ...DEFAULT_COLORS,
}

export function CTAFollow({ title, handle, reason, hintText, ...colors }: CTAFollowProps) {
  return (
    <SlideBase {...colors}>
      <div className="flex h-full flex-col items-center justify-center px-16 pb-24 pt-12 text-center">
        <h3 className="max-w-[920px] whitespace-pre-line text-[68px] font-bold leading-[1.18]">{title}</h3>
        <p
          className="mt-12 rounded-full px-16 py-8 text-[60px] font-black text-white shadow-[0_12px_35px_rgba(255,107,53,0.5)]"
          style={{ backgroundColor: colors.accentColor }}
        >
          팔로우 {handle}
        </p>
        {hintText ? (
          <p className="mt-4 text-[34px] font-semibold" style={{ color: `${colors.accentColor}ee` }}>
            {hintText}
          </p>
        ) : null}
        <p className="mt-8 max-w-[900px] whitespace-pre-line text-[34px] leading-relaxed" style={{ color: colors.mutedColor }}>
          {reason}
        </p>
        <p className="mt-3 max-w-[900px] text-[30px] leading-relaxed" style={{ color: colors.mutedColor }}>
          실제 자동화 워크플로우, 프롬프트, 운영 체크리스트까지 받아보세요.
        </p>
      </div>
    </SlideBase>
  )
}
