"use client";

import { memo } from "react";
import { Handle, Position, type Node } from "@xyflow/react";

export interface VariantNodeData extends Record<string, unknown> {
  variantId: string;
  generation: number;
  model: string;
  tone: string;
  isSelected: boolean;
  bodyPreview: string;
  score: number | null;
  channel: string;
  createdAt: string;
}

export type VariantNodeType = Node<VariantNodeData, "variant">;

const CHANNEL_ICONS: Record<string, string> = {
  threads: "🧵", x: "𝕏", linkedin: "💼", brxce_guide: "🦞",
  instagram: "📷", youtube: "▶️", newsletter: "📧",
};

function VariantNode({ data, selected }: { data: VariantNodeData; selected?: boolean }) {
  const time = new Date(data.createdAt).toLocaleString("ko-KR", {
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="variant-node">
      <Handle type="target" position={Position.Left} />
      <div
        className={`
          w-[280px] rounded-xl border-2 p-3 transition-all
          ${data.isSelected
            ? "border-[#4ECDC4] bg-[#4ECDC4]/10 shadow-lg shadow-[#4ECDC4]/20"
            : selected
              ? "border-[#4ECDC4]/60 bg-[#1a1a1a] shadow-md"
              : "border-[#333] bg-[#141414] hover:border-[#555]"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222] text-[#FF6B35] font-bold">
              G{data.generation}
            </span>
            <span className="text-[10px] text-[#888] font-mono">{data.variantId.slice(0, 8)}</span>
            {data.channel && (
              <span className="text-sm">{CHANNEL_ICONS[data.channel] || "📄"}</span>
            )}
          </div>
          {data.isSelected && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#4ECDC4] text-black font-bold">선택됨</span>
          )}
        </div>

        {/* Body preview */}
        <div className="text-[11px] text-[#aaa] leading-relaxed line-clamp-4 mb-2">
          {data.bodyPreview || "콘텐츠 없음"}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-[10px] text-[#555]">
          <div className="flex items-center gap-2">
            {data.tone && <span className="px-1 py-0.5 rounded bg-[#222] text-[#888]">{data.tone}</span>}
            <span>{data.model?.split("/").pop()?.slice(0, 15) || "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            {data.score != null && (
              <span className="text-yellow-500">{"★".repeat(data.score)}{"☆".repeat(5 - data.score)}</span>
            )}
            <span>{time}</span>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(VariantNode);
