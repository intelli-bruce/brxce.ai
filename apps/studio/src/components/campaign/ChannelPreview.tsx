"use client";

import type { CampaignVariant } from "@/lib/campaign/types";

const CHANNEL_SPECS: Record<string, { charLimit: number; imageRatio: string; imagePx: string; maxImages: number }> = {
  threads: { charLimit: 500, imageRatio: "4:5", imagePx: "1080×1350", maxImages: 10 },
  x: { charLimit: 280, imageRatio: "16:9", imagePx: "1200×675", maxImages: 4 },
  linkedin: { charLimit: 3000, imageRatio: "1.91:1", imagePx: "1200×627", maxImages: 20 },
  brxce_guide: { charLimit: 99999, imageRatio: "3:2", imagePx: "1200×800", maxImages: 99 },
  instagram: { charLimit: 2200, imageRatio: "4:5", imagePx: "1080×1350", maxImages: 10 },
};

export { CHANNEL_SPECS };

const AVATAR = "https://brxce.ai/avatar.jpg";

function CharCount({ current, limit }: { current: number; limit: number }) {
  const pct = Math.round((current / limit) * 100);
  const over = current > limit;
  return (
    <span className={`text-[10px] ${over ? "text-red-400 font-bold" : "text-[#666]"}`}>
      {current.toLocaleString()}/{limit.toLocaleString()}자 ({pct}%)
      {over && " ⚠️ 초과"}
    </span>
  );
}

function ThreadsPreview({ body, imageUrl }: { body: string; imageUrl?: string }) {
  return (
    <div className="bg-[#101010] rounded-xl p-3 w-[320px] border border-[#222]">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#333] overflow-hidden">
            <img src={AVATAR} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm font-semibold text-[#fafafa]">brxce.ai</span>
            <span className="text-xs text-[#666]">· 방금</span>
          </div>
          <p className="text-sm text-[#e0e0e0] whitespace-pre-wrap break-words leading-relaxed">
            {body || <span className="text-[#555] italic">콘텐츠 없음</span>}
          </p>
          {imageUrl && (
            <div className="mt-2 rounded-lg overflow-hidden" style={{ aspectRatio: "4/5", maxHeight: 200 }}>
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-6 mt-3 text-[#666]">
            <span className="text-base cursor-pointer hover:text-red-400">♡</span>
            <span className="text-base cursor-pointer hover:text-[#aaa]">💬</span>
            <span className="text-base cursor-pointer hover:text-[#aaa]">🔁</span>
            <span className="text-base cursor-pointer hover:text-[#aaa]">✈</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function XPreview({ body, imageUrl }: { body: string; imageUrl?: string }) {
  const over = body.length > 280;
  return (
    <div className="bg-[#101010] rounded-xl p-3 w-[320px] border border-[#222]">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#333] overflow-hidden">
            <img src={AVATAR} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm font-semibold text-[#fafafa]">Bruce Choe</span>
            <span className="text-xs text-[#666]">@brxce_ai · 방금</span>
          </div>
          <p className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${over ? "text-red-300" : "text-[#e0e0e0]"}`}>
            {body || <span className="text-[#555] italic">콘텐츠 없음</span>}
          </p>
          {over && <div className="text-[10px] text-red-400 mt-1">⚠️ 280자 초과 ({body.length}자)</div>}
          {imageUrl && (
            <div className="mt-2 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9", maxHeight: 180 }}>
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center justify-between mt-3 text-[#666] text-sm px-1">
            <span className="cursor-pointer hover:text-[#1d9bf0]">💬 <span className="text-xs">0</span></span>
            <span className="cursor-pointer hover:text-green-400">🔁 <span className="text-xs">0</span></span>
            <span className="cursor-pointer hover:text-red-400">♡ <span className="text-xs">0</span></span>
            <span className="cursor-pointer hover:text-[#1d9bf0]">📊 <span className="text-xs">0</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview({ body, imageUrl }: { body: string; imageUrl?: string }) {
  const lines = body.split("\n");
  const truncated = lines.length > 5;
  const displayText = truncated ? lines.slice(0, 5).join("\n") : body;

  return (
    <div className="bg-[#101010] rounded-xl p-3 w-[320px] border border-[#222]">
      <div className="flex gap-3 mb-2">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#333] overflow-hidden">
            <img src={AVATAR} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-[#fafafa]">Bruce Choe</div>
          <div className="text-[11px] text-[#888]">CEO, 인텔리이펙트</div>
          <div className="text-[10px] text-[#666]">방금 · 🌐</div>
        </div>
      </div>
      <p className="text-sm text-[#e0e0e0] whitespace-pre-wrap break-words leading-relaxed">
        {displayText || <span className="text-[#555] italic">콘텐츠 없음</span>}
        {truncated && <span className="text-[#0a66c2] cursor-pointer ml-1">...더보기</span>}
      </p>
      {imageUrl && (
        <div className="mt-2 rounded-lg overflow-hidden" style={{ aspectRatio: "1.91/1", maxHeight: 170 }}>
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex items-center gap-6 mt-3 pt-2 border-t border-[#222] text-[#666] text-sm">
        <span className="cursor-pointer hover:text-[#0a66c2]">👍</span>
        <span className="cursor-pointer hover:text-[#0a66c2]">💬</span>
        <span className="cursor-pointer hover:text-[#0a66c2]">🔄</span>
        <span className="cursor-pointer hover:text-[#0a66c2]">✈</span>
      </div>
    </div>
  );
}

function GenericPreview({ body, channel }: { body: string; channel: string }) {
  return (
    <div className="bg-[#101010] rounded-xl p-3 w-[320px] border border-[#222]">
      <div className="text-[10px] text-[#666] mb-2 uppercase">{channel} preview</div>
      <p className="text-sm text-[#e0e0e0] whitespace-pre-wrap break-words leading-relaxed line-clamp-6">
        {body || <span className="text-[#555] italic">콘텐츠 없음</span>}
      </p>
    </div>
  );
}

interface ChannelPreviewProps {
  channel: string;
  variant: CampaignVariant;
  imageUrl?: string;
}

export default function ChannelPreview({ channel, variant, imageUrl }: ChannelPreviewProps) {
  const body = variant.output?.body || variant.output?.text || "";
  const spec = CHANNEL_SPECS[channel];
  
  return (
    <div>
      {channel === "threads" && <ThreadsPreview body={body} imageUrl={imageUrl} />}
      {channel === "x" && <XPreview body={body} imageUrl={imageUrl} />}
      {channel === "linkedin" && <LinkedInPreview body={body} imageUrl={imageUrl} />}
      {channel === "instagram" && <ThreadsPreview body={body} imageUrl={imageUrl} />}
      {!["threads", "x", "linkedin", "instagram"].includes(channel) && (
        <GenericPreview body={body} channel={channel} />
      )}
      {spec && (
        <div className="mt-1.5 px-1">
          <CharCount current={body.length} limit={spec.charLimit} />
        </div>
      )}
    </div>
  );
}
