"use client";

import { memo } from "react";
import { Handle, Position, type Node } from "@xyflow/react";

export interface SnapshotNodeData extends Record<string, unknown> {
  label: string;
  createdAt: string;
  bodyPreview: string;
  isCurrent: boolean;
}

export type SnapshotNodeType = Node<SnapshotNodeData, "snapshot">;

function SnapshotNode({ data, selected }: { data: SnapshotNodeData; selected?: boolean }) {
  const time = new Date(data.createdAt).toLocaleString("ko-KR", {
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="snapshot-node">
      <Handle type="target" position={Position.Left} />
      <div
        className={`
          w-[320px] rounded-xl border-2 p-3 transition-all
          ${data.isCurrent
            ? "border-[#FF6B35] bg-[#FF6B35]/10 shadow-lg shadow-[#FF6B35]/20"
            : selected
              ? "border-[#FF6B35]/60 bg-[#1a1a1a] shadow-md"
              : "border-[#333] bg-[#141414] hover:border-[#555]"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">📸</span>
            <span className={`text-xs font-semibold ${data.isCurrent ? "text-[#FF6B35]" : "text-[#ccc]"}`}>
              {data.label || "스냅샷"}
            </span>
          </div>
          {data.isCurrent && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF6B35] text-white font-bold">CURRENT</span>
          )}
        </div>

        {/* Body preview */}
        <div className="text-[11px] text-[#888] leading-relaxed line-clamp-3 mb-2">
          {data.bodyPreview || "내용 없음"}
        </div>

        {/* Footer */}
        <div className="text-[10px] text-[#555]">{time}</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(SnapshotNode);
