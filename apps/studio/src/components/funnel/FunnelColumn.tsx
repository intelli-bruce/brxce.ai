"use client";

import { type FunnelItem, type FunnelStage, FUNNEL_STAGES } from "@/lib/funnel";
import FunnelCard from "./FunnelCard";

interface FunnelColumnProps {
  stage: FunnelStage;
  items: FunnelItem[];
}

export default function FunnelColumn({ stage, items }: FunnelColumnProps) {
  const cfg = FUNNEL_STAGES[stage];
  const completedCount = items.filter(
    (i) => i.type === "slot" ? i.status === "completed" : i.status === "published" || i.status === "completed"
  ).length;
  const total = items.length;

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Column Header */}
      <div className="rounded-xl border border-[#222] bg-[#111] p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">{cfg.icon}</span>
          <span className="font-bold text-sm" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
          <span className="text-[11px] text-[#666]">{cfg.sublabel}</span>
          <span className="ml-auto text-[11px] text-[#888]">
            {completedCount}/{total}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 rounded-full bg-[#1a1a1a] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: total > 0 ? `${(completedCount / total) * 100}%` : "0%",
              backgroundColor: cfg.color,
            }}
          />
        </div>
        {cfg.targetPct > 0 && (
          <p className="text-[10px] text-[#555] mt-1">목표 비중: {cfg.targetPct}%</p>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <FunnelCard key={`${item.type}-${item.id}`} item={item} />
        ))}
        {items.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#222] p-4 text-center text-[11px] text-[#555]">
            아직 항목이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
