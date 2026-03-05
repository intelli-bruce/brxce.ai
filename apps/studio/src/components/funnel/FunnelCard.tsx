"use client";

import Link from "next/link";
import {
  type FunnelItem,
  type FunnelSlot,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  CHANNEL_LABELS,
  FUNNEL_STAGES,
} from "@/lib/funnel";

interface FunnelCardProps {
  item: FunnelItem;
}

export default function FunnelCard({ item }: FunnelCardProps) {
  const stageColor = FUNNEL_STAGES[item.funnel_stage].color;

  if (item.type === "slot") return <SlotCard item={item} stageColor={stageColor} />;

  // Campaign or Content card
  const href = item.type === "campaign" ? `/campaigns/${item.id}` : `/contents/${item.id}`;
  const statusCfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.planned;
  const typeLabel = item.type === "campaign" ? "캠페인" : "콘텐츠";

  return (
    <Link href={href} className="block no-underline">
      <div
        className="rounded-lg border border-[#333] bg-[#141414] p-3 hover:border-[#444] transition-colors cursor-pointer"
        style={{ borderLeftColor: stageColor, borderLeftWidth: 3 }}
      >
        <div className="flex items-start gap-2 mb-1.5">
          <span className="text-sm font-medium text-[#e5e5e5] flex-1 leading-snug">
            {item.title}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] text-[#888]">
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#666]">
            {typeLabel}
          </span>
          {item.type === "content" && item.category && (
            <span className="text-[10px] text-[#555]">{item.category}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SlotCard({ item, stageColor }: { item: FunnelSlot; stageColor: string }) {
  const statusCfg = STATUS_CONFIG[item.status];
  const priorityCfg = PRIORITY_CONFIG[item.priority];
  const channelLabel = item.channel ? CHANNEL_LABELS[item.channel] ?? item.channel : null;
  const isPlanned = item.status === "planned";

  return (
    <div
      className={`rounded-lg p-3 transition-colors ${
        isPlanned
          ? "border border-dashed border-[#333] bg-[#0f0f0f] hover:border-[#444]"
          : "border border-[#333] bg-[#141414] hover:border-[#444]"
      }`}
      style={{ borderLeftColor: stageColor, borderLeftWidth: 3, borderLeftStyle: "solid" }}
    >
      <div className="flex items-start gap-2 mb-1.5">
        <span className="text-sm font-medium text-[#e5e5e5] flex-1 leading-snug">
          {item.title}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Status */}
        <span className="flex items-center gap-1 text-[10px] text-[#888]">
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>

        {/* Phase */}
        {item.phase && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#888]">
            P{item.phase}
          </span>
        )}

        {/* Priority */}
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityCfg.bg}`}>
          {priorityCfg.label}
        </span>

        {/* Channel */}
        {channelLabel && (
          <span className="text-[10px] text-[#555]">{channelLabel}</span>
        )}
      </div>

      {/* Notes preview */}
      {item.notes && (
        <p className="mt-1.5 text-[10px] text-[#555] leading-relaxed line-clamp-2">
          {item.notes}
        </p>
      )}
    </div>
  );
}
