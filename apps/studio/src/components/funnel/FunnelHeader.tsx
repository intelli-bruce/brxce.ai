"use client";

import type { FunnelData } from "@/lib/funnel";

interface FunnelHeaderProps {
  stats: FunnelData["stats"];
}

export default function FunnelHeader({ stats }: FunnelHeaderProps) {
  const { total, completed, byPhase } = stats;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const phases = Object.entries(byPhase)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([phase, s]) => ({ phase: Number(phase), ...s }));

  return (
    <div className="rounded-xl border border-[#222] bg-[#111] p-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Overall progress */}
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <span className="text-xs text-[#888]">진행률</span>
          <div className="flex-1 h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#FF6B35] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm font-medium text-[#fafafa]">
            {pct}% <span className="text-[#666] text-xs">({completed}/{total})</span>
          </span>
        </div>

        {/* Phase breakdown */}
        <div className="flex items-center gap-3">
          {phases.map(({ phase, total: t, completed: c }) => (
            <span key={phase} className="text-[11px] text-[#888]">
              P{phase}:{" "}
              <span className={c === t && t > 0 ? "text-green-400" : "text-[#ccc]"}>
                {c}/{t}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
