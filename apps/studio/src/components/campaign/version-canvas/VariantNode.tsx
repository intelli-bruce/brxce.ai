"use client";

import { memo } from "react";
import { Handle, Position, type Node } from "@xyflow/react";

export interface VariantNodeData extends Record<string, unknown> {
  variantId: string;
  generation: number;
  model: string;
  tone: string;
  isSelected: boolean;
  body: string;
  score: number | null;
  channel: string;
  createdAt: string;
}

export type VariantNodeType = Node<VariantNodeData, "variant">;

const AVATAR = "https://brxce.ai/avatar.jpg";

/* ── Channel Mockups ── */

function ThreadsMockup({ body }: { body: string }) {
  return (
    <div className="bg-[#101010] rounded-xl p-3 w-full">
      <div className="flex gap-2.5">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#333] overflow-hidden">
            <img src={AVATAR} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-semibold text-[#fafafa]">brxce.ai</span>
            <span className="text-[10px] text-[#666]">· 방금</span>
          </div>
          <p className="text-[11px] text-[#e0e0e0] whitespace-pre-wrap break-words leading-relaxed line-clamp-[12]">
            {body || <span className="text-[#555] italic">콘텐츠 없음</span>}
          </p>
          <div className="flex items-center gap-5 mt-2 text-[#666] text-[11px]">
            <span>♡</span><span>💬</span><span>🔁</span><span>✈</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function XMockup({ body }: { body: string }) {
  return (
    <div className="bg-[#101010] rounded-xl p-3 w-full">
      <div className="flex gap-2.5">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#333] overflow-hidden">
            <img src={AVATAR} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-semibold text-[#fafafa]">Bruce Choe</span>
            <span className="text-[10px] text-[#666]">@brxce_ai · 방금</span>
          </div>
          <p className="text-[11px] text-[#e0e0e0] whitespace-pre-wrap break-words leading-relaxed line-clamp-[8]">
            {body || <span className="text-[#555] italic">콘텐츠 없음</span>}
          </p>
          <div className="flex items-center justify-between mt-2 text-[#666] text-[10px] px-1">
            <span>💬 0</span><span>🔁 0</span><span>♡ 0</span><span>📊 0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkedInMockup({ body }: { body: string }) {
  const lines = body.split("\n");
  const display = lines.length > 6 ? lines.slice(0, 6).join("\n") : body;
  return (
    <div className="bg-[#101010] rounded-xl p-3 w-full">
      <div className="flex gap-2.5 mb-2">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#333] overflow-hidden">
            <img src={AVATAR} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-[#fafafa]">Bruce Choe</div>
          <div className="text-[9px] text-[#888]">CEO, 인텔리이펙트</div>
        </div>
      </div>
      <p className="text-[11px] text-[#e0e0e0] whitespace-pre-wrap break-words leading-relaxed line-clamp-[8]">
        {display || <span className="text-[#555] italic">콘텐츠 없음</span>}
        {lines.length > 6 && <span className="text-[#0a66c2] ml-1">...더보기</span>}
      </p>
      <div className="flex items-center gap-5 mt-2 pt-2 border-t border-[#222] text-[#666] text-[10px]">
        <span>👍</span><span>💬</span><span>🔄</span><span>✈</span>
      </div>
    </div>
  );
}

function ChannelMockup({ channel, body }: { channel: string; body: string }) {
  switch (channel) {
    case "threads":
    case "instagram":
      return <ThreadsMockup body={body} />;
    case "x":
      return <XMockup body={body} />;
    case "linkedin":
      return <LinkedInMockup body={body} />;
    default:
      return (
        <div className="bg-[#101010] rounded-xl p-3 w-full">
          <div className="text-[9px] text-[#666] mb-1 uppercase">{channel}</div>
          <p className="text-[11px] text-[#e0e0e0] whitespace-pre-wrap break-words leading-relaxed line-clamp-6">
            {body || <span className="text-[#555] italic">콘텐츠 없음</span>}
          </p>
        </div>
      );
  }
}

/* ── Node ── */

function VariantNode({ data, selected }: { data: VariantNodeData; selected?: boolean }) {
  return (
    <div className="variant-node">
      <Handle type="target" position={Position.Left} />
      <div
        className={`
          w-[320px] rounded-xl border-2 overflow-hidden transition-all
          ${data.isSelected
            ? "border-[#4ECDC4] shadow-lg shadow-[#4ECDC4]/20"
            : selected
              ? "border-[#4ECDC4]/60 shadow-md"
              : "border-[#333] hover:border-[#555]"
          }
        `}
      >
        {/* Header strip */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a0a0a] border-b border-[#222]">
          <div className="flex items-center gap-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#222] text-[#FF6B35] font-bold">
              G{data.generation}
            </span>
            <span className="text-[9px] text-[#666] font-mono">{data.variantId.slice(0, 8)}</span>
            {data.tone && <span className="text-[9px] px-1 py-0.5 rounded bg-[#222] text-[#888]">{data.tone}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {data.score != null && (
              <span className="text-[9px] text-yellow-500">{"★".repeat(data.score)}{"☆".repeat(5 - data.score)}</span>
            )}
            {data.isSelected && (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#4ECDC4] text-black font-bold">선택됨</span>
            )}
          </div>
        </div>

        {/* Channel mockup body */}
        <ChannelMockup channel={data.channel} body={data.body} />
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(VariantNode);
