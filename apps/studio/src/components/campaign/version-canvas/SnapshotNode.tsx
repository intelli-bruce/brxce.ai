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

  // Extract first heading and first paragraph from markdown preview
  const lines = (data.bodyPreview || "").split("\n").filter(Boolean);
  const heading = lines.find(l => l.startsWith("#"))?.replace(/^#+\s*/, "") || "";
  const bodyLines = lines.filter(l => !l.startsWith("#")).slice(0, 6);

  return (
    <div className="snapshot-node">
      <Handle type="target" position={Position.Left} />
      <div
        className={`
          w-[360px] rounded-xl border-2 overflow-hidden transition-all
          ${data.isCurrent
            ? "border-[#FF6B35] shadow-lg shadow-[#FF6B35]/20"
            : selected
              ? "border-[#FF6B35]/60 shadow-md"
              : "border-[#333] hover:border-[#555]"
          }
        `}
      >
        {/* Guide article header */}
        <div className="px-4 py-2 bg-[#0a0a0a] border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🦞</span>
            <span className="text-[10px] font-semibold text-[#FF6B35]">brxce.ai</span>
            <span className="text-[10px] text-[#555]">/guides</span>
          </div>
          <div className="flex items-center gap-2">
            {data.isCurrent && (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#FF6B35] text-white font-bold">LIVE</span>
            )}
            <span className="text-[9px] text-[#555]">{time}</span>
          </div>
        </div>

        {/* Article body mockup */}
        <div className="px-4 py-3 bg-[#101010]">
          {/* Snapshot label */}
          <div className="text-[9px] text-[#666] mb-2 flex items-center gap-1.5">
            <span>📸</span>
            <span>{data.label || "스냅샷"}</span>
          </div>

          {/* Title */}
          {heading && (
            <h3 className="text-[13px] font-bold text-[#fafafa] leading-snug mb-2 line-clamp-2">
              {heading}
            </h3>
          )}

          {/* Body excerpt - styled like article content */}
          <div className="space-y-1.5">
            {bodyLines.map((line, i) => (
              <p key={i} className="text-[10px] text-[#999] leading-relaxed line-clamp-2">
                {line}
              </p>
            ))}
          </div>

          {/* Fade out */}
          <div className="mt-2 h-4 bg-gradient-to-b from-transparent to-[#101010]" />

          {/* Footer */}
          <div className="flex items-center justify-between mt-1 text-[9px] text-[#555]">
            <span>{data.bodyPreview.length.toLocaleString()}자</span>
            <span className="text-[#444]">⋮</span>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(SnapshotNode);
