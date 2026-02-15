"use client";

import type { CampaignVariant } from "@/lib/campaign/types";

interface Props {
  variant: CampaignVariant;
  channel: string;
}

export default function ChannelPreview({ variant, channel }: Props) {
  const body = variant.output?.body || "";

  switch (channel) {
    case "threads": return <ThreadsPreview body={body} />;
    case "x": return <XPreview body={body} />;
    case "linkedin": return <LinkedInPreview body={body} />;
    case "instagram": return <InstagramPreview body={body} />;
    case "newsletter": return <NewsletterPreview body={body} />;
    case "brxce_guide": return <GuidePreview body={body} />;
    case "youtube": return <YouTubePreview body={body} />;
    default: return <div className="text-xs text-[#555]">프리뷰 없음</div>;
  }
}

// --- Threads ---
function ThreadsPreview({ body }: { body: string }) {
  const truncated = body.length > 500;
  const display = truncated ? body.slice(0, 497) + "..." : body;

  return (
    <PhoneMockup>
      <div className="bg-white text-black rounded-none">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] flex items-center justify-center text-white text-xs font-bold">🦞</div>
          <div>
            <div className="text-[13px] font-semibold">brxce.ai</div>
            <div className="text-[11px] text-gray-400">방금</div>
          </div>
        </div>
        {/* Body */}
        <div className="px-4 py-3">
          <div className="text-[14px] leading-[1.45] whitespace-pre-wrap">{display}</div>
          {truncated && <div className="text-[13px] text-gray-400 mt-1">...더 보기</div>}
        </div>
        {/* Actions */}
        <div className="flex items-center gap-6 px-4 py-2.5 border-t border-gray-100 text-gray-400">
          <span className="text-[18px]">♡</span>
          <span className="text-[18px]">💬</span>
          <span className="text-[18px]">↗</span>
          <span className="text-[18px] ml-auto">⋯</span>
        </div>
      </div>
    </PhoneMockup>
  );
}

// --- X (Twitter) ---
function XPreview({ body }: { body: string }) {
  const truncated = body.length > 280;
  const display = truncated ? body.slice(0, 277) + "..." : body;
  const charCount = body.length;

  return (
    <PhoneMockup>
      <div className="bg-black text-white rounded-none">
        <div className="flex gap-2.5 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] flex items-center justify-center text-xs font-bold shrink-0">🦞</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold">BRXCE</span>
              <span className="text-[13px] text-gray-500">@brxce_ai</span>
              <span className="text-[13px] text-gray-500">· 방금</span>
            </div>
            <div className="text-[15px] leading-[1.35] mt-1 whitespace-pre-wrap">{display}</div>
            {/* Actions */}
            <div className="flex items-center justify-between mt-3 text-gray-500 text-[13px] pr-8">
              <span>💬 0</span>
              <span>🔄 0</span>
              <span>♡ 0</span>
              <span>📊 0</span>
            </div>
          </div>
        </div>
        {/* Char count warning */}
        {truncated && (
          <div className="px-4 pb-2 text-xs text-red-400">⚠️ {charCount}/280자 — 초과됨</div>
        )}
      </div>
    </PhoneMockup>
  );
}

// --- LinkedIn ---
function LinkedInPreview({ body }: { body: string }) {
  const lines = body.split("\n");
  const preview = lines.slice(0, 3).join("\n");
  const hasMore = lines.length > 3 || body.length > 200;

  return (
    <PhoneMockup>
      <div className="bg-white text-black rounded-none">
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] flex items-center justify-center text-white text-sm font-bold">🦞</div>
          <div>
            <div className="text-[14px] font-semibold">Bruce Choe</div>
            <div className="text-[12px] text-gray-500">Lead IT-Consultant, CEO at IntelliEffect</div>
            <div className="text-[11px] text-gray-400">방금 · 🌐</div>
          </div>
        </div>
        <div className="px-4 py-2">
          <div className="text-[14px] leading-[1.45] whitespace-pre-wrap">
            {hasMore ? preview : body}
          </div>
          {hasMore && <div className="text-[13px] text-[#0a66c2] mt-1 cursor-pointer">...더 보기</div>}
        </div>
        <div className="flex items-center justify-around py-2 border-t border-gray-200 text-gray-500 text-[12px]">
          <span>👍 좋아요</span>
          <span>💬 댓글</span>
          <span>↗ 공유</span>
          <span>📤 보내기</span>
        </div>
      </div>
    </PhoneMockup>
  );
}

// --- Instagram ---
function InstagramPreview({ body }: { body: string }) {
  const truncated = body.length > 125;
  const display = truncated ? body.slice(0, 122) + "..." : body;

  return (
    <PhoneMockup>
      <div className="bg-black text-white rounded-none">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B35] via-[#fd1d1d] to-[#833ab4] p-[2px]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px]">🦞</div>
          </div>
          <span className="text-[13px] font-semibold">brxce.ai</span>
          <span className="text-gray-500 ml-auto text-lg">⋯</span>
        </div>
        {/* Image placeholder */}
        <div className="aspect-[4/5] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
          <span className="text-4xl opacity-20">📸</span>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-4 px-3 py-2.5">
          <span className="text-[22px]">♡</span>
          <span className="text-[22px]">💬</span>
          <span className="text-[22px]">↗</span>
          <span className="text-[22px] ml-auto">🔖</span>
        </div>
        {/* Caption */}
        <div className="px-3 pb-3">
          <span className="text-[13px] font-semibold mr-1.5">brxce.ai</span>
          <span className="text-[13px] leading-[1.35] whitespace-pre-wrap">{display}</span>
          {truncated && <span className="text-[13px] text-gray-500 ml-1">더 보기</span>}
        </div>
      </div>
    </PhoneMockup>
  );
}

// --- Newsletter ---
function NewsletterPreview({ body }: { body: string }) {
  return (
    <div className="max-w-[600px] mx-auto bg-white text-black rounded-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-[#0A0A0A] px-8 py-6 text-center">
        <div className="text-2xl mb-1">🦞</div>
        <div className="text-white text-lg font-bold tracking-wide">brxce.ai</div>
        <div className="text-gray-400 text-xs mt-1">에이전틱 워크플로우 인사이트</div>
      </div>
      {/* Body */}
      <div className="px-8 py-6">
        <div className="text-[15px] leading-[1.6] whitespace-pre-wrap text-gray-800">
          {body.length > 1000 ? body.slice(0, 997) + "..." : body}
        </div>
      </div>
      {/* CTA */}
      <div className="px-8 pb-6 text-center">
        <div className="inline-block px-6 py-2.5 bg-[#FF6B35] text-white rounded-lg text-sm font-semibold">
          전체 가이드 읽기 →
        </div>
      </div>
      {/* Footer */}
      <div className="border-t border-gray-200 px-8 py-4 text-center text-xs text-gray-400">
        bruce@brxce.ai · 구독 해지
      </div>
    </div>
  );
}

// --- Guide (brxce.ai) ---
function GuidePreview({ body }: { body: string }) {
  return (
    <div className="max-w-[720px] mx-auto bg-[#0A0A0A] text-[#fafafa] rounded-lg border border-[#222] overflow-hidden">
      {/* Nav mock */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#222]">
        <span className="text-sm font-bold">🦞 brxce.ai</span>
        <div className="flex gap-4 text-xs text-[#888]">
          <span>가이드</span>
          <span>실전활용법</span>
          <span>쇼케이스</span>
        </div>
      </div>
      {/* Article */}
      <div className="px-8 py-8">
        <div className="text-sm text-[#FF6B35] mb-2">가이드북</div>
        <div className="prose-preview text-[15px] leading-[1.7] whitespace-pre-wrap text-[#ccc]">
          {body.length > 2000 ? body.slice(0, 1997) + "\n\n..." : body}
        </div>
      </div>
    </div>
  );
}

// --- YouTube ---
function YouTubePreview({ body }: { body: string }) {
  return (
    <PhoneMockup>
      <div className="bg-[#0f0f0f] text-white rounded-none">
        {/* Video placeholder */}
        <div className="aspect-video bg-[#1a1a1a] flex items-center justify-center relative">
          <span className="text-5xl opacity-20">▶️</span>
          <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px]">0:30</div>
        </div>
        {/* Script as captions */}
        <div className="p-4">
          <div className="text-xs text-gray-400 mb-2">📝 스크립트 프리뷰</div>
          <div className="text-[13px] leading-[1.5] whitespace-pre-wrap text-gray-300">
            {body.length > 500 ? body.slice(0, 497) + "..." : body}
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
}

// --- Phone mockup shell ---
function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[375px] mx-auto">
      <div className="rounded-2xl border-2 border-[#333] overflow-hidden shadow-xl">
        {/* Status bar */}
        <div className="bg-black flex items-center justify-between px-4 py-1.5 text-white text-[11px]">
          <span>9:41</span>
          <div className="flex gap-1.5">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
