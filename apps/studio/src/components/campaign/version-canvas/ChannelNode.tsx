"use client";

import { memo } from "react";
import { Handle, Position, type Node } from "@xyflow/react";
import { SiThreads, SiX } from "@icons-pack/react-simple-icons";

export interface ChannelNodeData extends Record<string, unknown> {
  channel: string;
  variantCount: number;
}

export type ChannelNodeType = Node<ChannelNodeData, "channel">;

const CHANNEL_CONFIG: Record<string, { label: string; bg: string; border: string; iconColor: string; textColor: string }> = {
  threads: { label: "Threads", bg: "#000000", border: "#333", iconColor: "#ffffff", textColor: "#fafafa" },
  instagram: { label: "Threads", bg: "#000000", border: "#333", iconColor: "#ffffff", textColor: "#fafafa" },
  x: { label: "X", bg: "#000000", border: "#2f3336", iconColor: "#ffffff", textColor: "#e7e9ea" },
  linkedin: { label: "LinkedIn", bg: "#0a66c2", border: "#0a66c2", iconColor: "#ffffff", textColor: "#ffffff" },
};

function ChannelIconComponent({ channel, size = 36 }: { channel: string; size?: number }) {
  const cfg = CHANNEL_CONFIG[channel];
  const color = cfg?.iconColor || "#ffffff";

  switch (channel) {
    case "threads":
    case "instagram":
      return <SiThreads size={size} color={color} />;
    case "x":
      return <SiX size={size} color={color} />;
    case "linkedin":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill={color}/>
        </svg>
      );
    default:
      return <span className="text-2xl font-bold" style={{ color }}>{channel}</span>;
  }
}

function ChannelNode({ data }: { data: ChannelNodeData }) {
  const cfg = CHANNEL_CONFIG[data.channel] || { label: data.channel, bg: "#111", border: "#333", iconColor: "#fff", textColor: "#fafafa" };

  return (
    <div className="channel-node">
      <Handle type="target" position={Position.Left} />
      <div
        className="w-[160px] rounded-xl border-2 overflow-hidden flex flex-col items-center py-5 px-3 gap-2.5"
        style={{ background: cfg.bg, borderColor: cfg.border }}
      >
        <ChannelIconComponent channel={data.channel} size={36} />
        <span className="text-[14px] font-bold" style={{ color: cfg.textColor }}>
          {cfg.label}
        </span>
        <span className="text-[10px]" style={{ color: cfg.textColor + "80" }}>
          {data.variantCount}개 variant
        </span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(ChannelNode);
