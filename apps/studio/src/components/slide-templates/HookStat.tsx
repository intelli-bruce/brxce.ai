import { DEFAULT_COLORS, SlideBase, type BaseSlideStyleProps } from './SlideBase'

export interface HookStatProps extends BaseSlideStyleProps {
  statValue: string
  statLabel: string
  detail: string
}

export const hookStatDefaultProps: HookStatProps = {
  statValue: '73%',
  statLabel: '저장률 증가',
  detail: '구조화된 캐러셀을 사용한 계정 기준',
  ...DEFAULT_COLORS,
}

export function HookStat({ statValue, statLabel, detail, ...colors }: HookStatProps) {
  return (
    <SlideBase {...colors}>
      <div className="flex h-full flex-col px-16 pt-14 text-center">
        <div className="self-center rounded-3xl border border-white/15 px-12 py-4 text-[30px] uppercase tracking-[0.22em] text-white/70">impact metric</div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="text-[220px] font-black leading-none" style={{ color: colors.accentColor }}>
            {statValue}
          </p>
          <p className="mt-2 text-[64px] font-semibold leading-tight">{statLabel}</p>
        </div>

        <div className="pb-24">
          <div className="mx-auto h-[3px] w-40 rounded-full" style={{ backgroundColor: `${colors.accentColor}b3` }} />
          <p className="mx-auto mt-8 max-w-[900px] whitespace-pre-line text-[44px] leading-relaxed" style={{ color: colors.mutedColor }}>
            {detail}
          </p>
        </div>
      </div>
    </SlideBase>
  )
}
