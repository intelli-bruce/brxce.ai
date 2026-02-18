"use client";

import { memo } from "react";
import { Handle, Position, type Node } from "@xyflow/react";

export interface ChannelNodeData extends Record<string, unknown> {
  channel: string;
  variantCount: number;
}

export type ChannelNodeType = Node<ChannelNodeData, "channel">;

const CHANNEL_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  threads: { label: "Threads", color: "#fafafa", bg: "#000000", border: "#333" },
  instagram: { label: "Threads", color: "#fafafa", bg: "#000000", border: "#333" },
  x: { label: "X", color: "#e7e9ea", bg: "#000000", border: "#2f3336" },
  linkedin: { label: "LinkedIn", color: "#ffffff", bg: "#0a66c2", border: "#0a66c2" },
};

function ChannelIcon({ channel, size = 32 }: { channel: string; size?: number }) {
  const color = channel === "linkedin" ? "#ffffff" : "#fafafa";

  if (channel === "threads" || channel === "instagram") {
    return (
      <svg width={size} height={size} viewBox="0 0 192 192" fill="none">
        <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05a115.417 115.417 0 0 0-24.478-2.721c-28.148 0-46.228 15.27-46.228 38.308.113 22.74 20.178 37.654 43.132 37.654 17.058 0 33.272-8.347 42.182-23.14 6.3-10.458 9.111-23.726 8.476-39.584a61.033 61.033 0 0 1 17.374 13.56l11.692-13.373C161.87 79.498 152.652 72.818 141.537 88.988zm-49.891 59.531c-14.013 0-22.891-7.062-23.003-18.291-.084-8.09 5.755-18.283 30.432-18.283a98.167 98.167 0 0 1 22.102 2.557c-2.59 23.18-16.478 34.017-29.531 34.017z" fill={color}/>
      </svg>
    );
  }

  if (channel === "x") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill={color}/>
      </svg>
    );
  }

  if (channel === "linkedin") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill={color}/>
      </svg>
    );
  }

  return <span className="text-2xl">{channel}</span>;
}

function ChannelNode({ data }: { data: ChannelNodeData }) {
  const cfg = CHANNEL_CONFIG[data.channel] || { label: data.channel, color: "#fafafa", bg: "#111", border: "#333" };

  return (
    <div className="channel-node">
      <Handle type="target" position={Position.Left} />
      <div
        className="w-[160px] rounded-xl border-2 overflow-hidden flex flex-col items-center py-5 px-3 gap-2.5"
        style={{ background: cfg.bg, borderColor: cfg.border }}
      >
        <ChannelIcon channel={data.channel} size={36} />
        <span className="text-[14px] font-bold" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        <span className="text-[10px]" style={{ color: cfg.color + "80" }}>
          {data.variantCount}개 variant
        </span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(ChannelNode);
