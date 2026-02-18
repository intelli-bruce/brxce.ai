"use client";

import { memo } from "react";
import { Handle, Position, type Node } from "@xyflow/react";
import { SiThreads, SiX, SiLinkedin } from "@icons-pack/react-simple-icons";

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
      return <SiLinkedin size={size} color={color} />;
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
