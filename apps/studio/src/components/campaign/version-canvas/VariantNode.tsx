"use client";

import { memo } from "react";
import { Handle, Position, type Node } from "@xyflow/react";
import { SiThreads, SiX, SiLinkedin } from "@icons-pack/react-simple-icons";

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
  mediaUrls?: string[];
  merged?: boolean;
  mergeNote?: string;
}

export type VariantNodeType = Node<VariantNodeData, "variant">;

const AVATAR = "/profile.jpg";

/* ── Threads ── */
function ThreadsMockup({ body }: { body: string }) {
  return (
    <div className="bg-[#101010] w-full">
      {/* Threads header bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#222]">
        <SiThreads size={14} color="#fafafa" />
        <span className="text-[10px] font-semibold text-[#fafafa]">Threads</span>
      </div>
      <div className="p-3">
        <div className="flex gap-2.5">
          <img src={AVATAR} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23333'/%3E%3C/svg%3E"; }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[12px] font-semibold text-[#fafafa]">brxce.ai</span>
              <span className="text-[10px] text-[#666]">· 방금</span>
            </div>
            <div className="">
              <p className="text-[11px] text-[#e0e0e0] whitespace-pre-wrap break-words leading-[1.5]">
                {body || <span className="text-[#555] italic">콘텐츠 없음</span>}
              </p>
            </div>
            <div className="flex items-center gap-6 mt-3 text-[#666]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"/></svg>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"/></svg>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── X (Twitter) ── */
function XMockup({ body }: { body: string }) {
  return (
    <div className="bg-black w-full">
      {/* X header bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2f3336]">
        <SiX size={14} color="#e7e9ea" />
        <span className="text-[10px] font-semibold text-[#e7e9ea]">Post</span>
      </div>
      <div className="p-3">
        <div className="flex gap-2.5">
          <img src={AVATAR} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23333'/%3E%3C/svg%3E"; }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[12px] font-bold text-[#e7e9ea]">Bruce Choe</span>
              <span className="text-[11px] text-[#71767b]">@brxce_ai · 방금</span>
            </div>
            <div className="">
              <p className="text-[12px] text-[#e7e9ea] whitespace-pre-wrap break-words leading-[1.4]">
                {body || <span className="text-[#71767b] italic">콘텐츠 없음</span>}
              </p>
            </div>
            {body.length > 280 && <div className="text-[9px] text-red-400 mt-1">⚠️ {body.length}/280자</div>}
            <div className="flex items-center justify-between mt-3 text-[#71767b] px-2">
              <div className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"/></svg><span className="text-[10px]">0</span></div>
              <div className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"/></svg><span className="text-[10px]">0</span></div>
              <div className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg><span className="text-[10px]">0</span></div>
              <svg className="w-3.5 h-3.5 text-[#71767b]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── LinkedIn ── */
function LinkedInMockup({ body }: { body: string }) {
  return (
    <div className="bg-[#1b1f23] w-full">
      {/* LinkedIn header bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#38434f]">
        <SiLinkedin size={14} color="#71b7fb" />
        <span className="text-[10px] font-semibold text-[#ffffffe6]">LinkedIn</span>
      </div>
      <div className="p-3">
        <div className="flex gap-2.5 mb-2">
          <img src={AVATAR} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23333'/%3E%3C/svg%3E"; }} />
          <div>
            <div className="text-[12px] font-semibold text-[#ffffffe6]">Bruce Choe</div>
            <div className="text-[10px] text-[#ffffff99]">CEO, 인텔리이펙트</div>
            <div className="text-[9px] text-[#ffffff66]">방금 · 🌐</div>
          </div>
        </div>
        <div className="">
          <p className="text-[11px] text-[#ffffffd9] whitespace-pre-wrap break-words leading-[1.5]">
            {body || <span className="text-[#ffffff66] italic">콘텐츠 없음</span>}
          </p>
        </div>
        <div className="flex items-center justify-around mt-3 pt-2 border-t border-[#38434f] text-[#ffffff99] text-[10px]">
          <span>👍 좋아요</span>
          <span>💬 댓글</span>
          <span>🔄 공유</span>
          <span>📨 보내기</span>
        </div>
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
        <div className="bg-[#101010] w-full p-3">
          <div className="text-[10px] text-[#666] mb-1 uppercase font-bold">{channel}</div>
          <div className="">
            <p className="text-[11px] text-[#e0e0e0] whitespace-pre-wrap break-words leading-relaxed">
              {body || <span className="text-[#555] italic">콘텐츠 없음</span>}
            </p>
          </div>
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
          w-[340px] rounded-xl overflow-hidden transition-all
          ${data.isSelected
            ? "ring-2 ring-[#4ECDC4] shadow-lg shadow-[#4ECDC4]/20"
            : selected
              ? "ring-2 ring-[#4ECDC4]/60 shadow-md"
              : "ring-1 ring-[#333] hover:ring-[#555]"
          }
        `}
      >
        {/* Generation + meta strip */}
        <div className="flex items-center justify-between px-2.5 py-1 bg-[#0a0a0a]">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] text-[#555] font-mono">{data.variantId.slice(0, 8)}</span>
            {data.tone && <span className="text-[8px] px-1 py-0.5 rounded bg-[#222] text-[#777]">{data.tone}</span>}
          </div>
          <div className="flex items-center gap-1">
            {data.merged && (
              <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-[#a855f7] text-white font-bold" title={data.mergeNote || '병합됨'}>⇄</span>
            )}
            {data.score != null && (
              <span className="text-[8px] text-yellow-500">{"★".repeat(data.score)}</span>
            )}
            {data.isSelected && (
              <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-[#4ECDC4] text-black font-bold">✓</span>
            )}
          </div>
        </div>

        {/* Channel mockup */}
        <ChannelMockup channel={data.channel} body={data.body} />

        {/* Media thumbnails */}
        {data.mediaUrls && data.mediaUrls.length > 0 && (
          <div className="flex gap-1 px-2 py-1.5 bg-[#0a0a0a] border-t border-[#222]">
            {data.mediaUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="w-14 h-10 rounded object-cover border border-[#333] flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ))}
            <span className="text-[8px] text-[#555] self-center ml-1">🖼</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(VariantNode);
