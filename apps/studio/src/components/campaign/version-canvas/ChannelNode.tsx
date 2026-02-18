"use client";

import { memo } from "react";
import { Handle, Position, type Node } from "@xyflow/react";

export interface ChannelNodeData extends Record<string, unknown> {
  channel: string;
  variantCount: number;
}

export type ChannelNodeType = Node<ChannelNodeData, "channel">;

const CHANNEL_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  threads: { label: "Threads", icon: "/icons/threads.svg", color: "#fafafa", bg: "#101010" },
  instagram: { label: "Threads", icon: "/icons/threads.svg", color: "#fafafa", bg: "#101010" },
  x: { label: "X", icon: "/icons/x.svg", color: "#e7e9ea", bg: "#000000" },
  linkedin: { label: "LinkedIn", icon: "/icons/linkedin.svg", color: "#ffffffe6", bg: "#1b1f23" },
};

function ChannelNode({ data }: { data: ChannelNodeData }) {
  const cfg = CHANNEL_CONFIG[data.channel] || { label: data.channel, icon: "", color: "#fafafa", bg: "#111" };

  return (
    <div className="channel-node">
      <Handle type="target" position={Position.Left} />
      <div
        className="w-[160px] rounded-xl border-2 border-[#333] overflow-hidden flex flex-col items-center py-4 px-3 gap-2"
        style={{ background: cfg.bg }}
      >
        {cfg.icon && (
          <img
            src={cfg.icon}
            alt={cfg.label}
            className="w-8 h-8"
            style={{ filter: data.channel === "linkedin" ? "brightness(0) invert(0.55) sepia(1) saturate(5) hue-rotate(180deg)" : "invert(1)" }}
          />
        )}
        <span className="text-[13px] font-bold" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        <span className="text-[10px] text-[#666]">
          {data.variantCount}개 variant
        </span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(ChannelNode);
