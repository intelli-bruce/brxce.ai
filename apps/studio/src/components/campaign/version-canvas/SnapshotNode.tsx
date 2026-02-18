"use client";

import { memo } from "react";
import { Handle, Position, type Node } from "@xyflow/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface SnapshotNodeData extends Record<string, unknown> {
  label: string;
  createdAt: string;
  bodyPreview: string;
  isCurrent: boolean;
  mediaUrls?: string[];
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
          w-[400px] rounded-xl border-2 overflow-hidden transition-all
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

        {/* Article body */}
        <div className="px-4 py-3 bg-[#101010]">
          {/* Snapshot label */}
          <div className="text-[9px] text-[#666] mb-2 flex items-center gap-1.5">
            <span>📸</span>
            <span>{data.label || "스냅샷"}</span>
          </div>

          {/* Markdown rendered content - scrollable */}
          <div className="snapshot-markdown">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-[14px] font-bold text-[#fafafa] leading-snug mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-[12px] font-bold text-[#e0e0e0] leading-snug mb-1.5 mt-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-[11px] font-semibold text-[#ccc] leading-snug mb-1 mt-2">{children}</h3>,
                p: ({ children }) => <p className="text-[10px] text-[#999] leading-relaxed mb-1.5">{children}</p>,
                strong: ({ children }) => <strong className="text-[#ccc] font-semibold">{children}</strong>,
                em: ({ children }) => <em className="text-[#aaa]">{children}</em>,
                ul: ({ children }) => <ul className="text-[10px] text-[#999] list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="text-[10px] text-[#999] list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                blockquote: ({ children }) => <blockquote className="border-l-2 border-[#FF6B35]/40 pl-2 my-1.5 text-[10px] text-[#888] italic">{children}</blockquote>,
                hr: () => <hr className="border-[#333] my-2" />,
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt || ""}
                    className="w-full rounded my-2 border border-[#333]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ),
                table: ({ children }) => <table className="w-full text-[9px] text-[#999] border-collapse my-2">{children}</table>,
                th: ({ children }) => <th className="border border-[#333] px-1.5 py-1 text-left text-[#ccc] bg-[#1a1a1a]">{children}</th>,
                td: ({ children }) => <td className="border border-[#333] px-1.5 py-1">{children}</td>,
                code: ({ children }) => <code className="text-[9px] bg-[#1a1a1a] text-[#FF6B35] px-1 rounded">{children}</code>,
                a: ({ children, href }) => <a href={href} className="text-[#FF6B35] underline">{children}</a>,
              }}
            >
              {data.bodyPreview}
            </ReactMarkdown>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#222] text-[9px] text-[#555]">
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
