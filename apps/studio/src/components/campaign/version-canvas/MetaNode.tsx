"use client";

import { memo } from "react";
import { Handle, Position, type Node } from "@xyflow/react";

export interface MetaNodeData extends Record<string, unknown> {
  message: string;
  type: "branch" | "edit" | "generate" | "feedback";
}

export type MetaNodeType = Node<MetaNodeData, "meta">;

const TYPE_STYLES: Record<string, { icon: string; color: string }> = {
  branch: { icon: "🔀", color: "#a855f7" },
  edit: { icon: "✏️", color: "#FF6B35" },
  generate: { icon: "🤖", color: "#4ECDC4" },
  feedback: { icon: "💬", color: "#eab308" },
};

function MetaNode({ data }: { data: MetaNodeData }) {
  const style = TYPE_STYLES[data.type] || TYPE_STYLES.edit;

  return (
    <div className="meta-node">
      <Handle type="target" position={Position.Left} />
      <div
        className="w-[200px] rounded-lg border border-dashed px-2.5 py-1.5 text-center"
        style={{ borderColor: style.color + "60", background: style.color + "08" }}
      >
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-xs">{style.icon}</span>
          <span className="text-[10px] leading-snug" style={{ color: style.color }}>
            {data.message || "—"}
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(MetaNode);
