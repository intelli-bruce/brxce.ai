"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

type Guide = {
  id: string;
  title: string;
  slug: string;
  hook?: string;
  category?: string;
  tags?: string[];
  media_urls?: string[];
  status?: string;
  created_at: string;
};

export default function GuideSection({
  title,
  guides,
  defaultOpen = false,
  isPreview = false,
}: {
  title: string;
  guides: Guide[];
  defaultOpen?: boolean;
  isPreview?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [waitlistGuide, setWaitlistGuide] = useState<Guide | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (guides.length === 0) return null;

  const isPublished = (g: Guide) => g.status === "published";

  async function submitWaitlist() {
    if (!email || !email.includes("@") || !waitlistGuide) return;
    setSubmitting(true);
    try {
      const sb = createSupabaseBrowser();
      await sb.from("submissions").insert({
        email,
        type: "waitlist",
        product: waitlistGuide.title,
      });
    } catch {}
    setSubmitting(false);
    setEmail("");
    setDone(true);
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-1 cursor-pointer bg-transparent border-none text-left group"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-[18px] font-bold text-[#fafafa]">{title}</h2>
          <span className="text-[13px] text-[#555]">{guides.length}편</span>
        </div>
        <svg
          className={`w-5 h-5 text-[#555] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="flex flex-col gap-2 mt-1">
          {guides.map((g, i) => {
            const published = isPublished(g);

            if (published || isPreview) {
              return (
                <Link
                  key={g.id}
                  href={`/guides/${g.slug || g.id}`}
                  className="flex items-center gap-4 py-3 px-4 rounded-xl bg-[#111] border border-[#1a1a1a] no-underline text-[#ccc] hover:border-[#333] hover:text-[#fafafa] transition-all group"
                >
                  <span className="text-[13px] text-[#444] font-mono w-6 shrink-0 text-right">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {g.media_urls?.[0] && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#0a0a0a] shrink-0">
                      <Image src={g.media_urls[0]} alt="" fill className="object-cover" sizes="48px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isPreview && g.status && g.status !== "published" && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-yellow-900/30 text-yellow-500 border border-yellow-800 shrink-0">
                          {g.status}
                        </span>
                      )}
                      <span className="text-[15px] font-medium truncate">{g.title}</span>
                    </div>
                    {g.hook && <p className="text-[13px] text-[#666] mt-0.5 truncate">{g.hook}</p>}
                  </div>
                  <svg className="w-4 h-4 text-[#333] group-hover:text-[#666] shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            }

            // Unpublished — show as clickable but trigger waitlist
            return (
              <button
                key={g.id}
                onClick={() => { setWaitlistGuide(g); setDone(false); setEmail(""); }}
                className="flex items-center gap-4 py-3 px-4 rounded-xl bg-[#111] border border-[#1a1a1a] text-[#ccc] hover:border-[#333] hover:text-[#fafafa] transition-all group cursor-pointer text-left w-full"
              >
                <span className="text-[13px] text-[#444] font-mono w-6 shrink-0 text-right">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#222] text-[#666] border border-[#333] shrink-0">
                      준비중
                    </span>
                    <span className="text-[15px] font-medium truncate text-[#888]">{g.title}</span>
                  </div>
                  {g.hook && <p className="text-[13px] text-[#555] mt-0.5 truncate">{g.hook}</p>}
                </div>
                <svg className="w-4 h-4 text-[#333] group-hover:text-[#666] shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* Waitlist Modal */}
      {waitlistGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && setWaitlistGuide(null)}
        >
          <div className="bg-[#141414] border border-[#333] rounded-2xl p-8 max-w-[380px] w-full text-center">
            {!done ? (
              <>
                <div className="text-4xl mb-3">🦞</div>
                <h2 className="text-lg font-bold mb-2">{waitlistGuide.title}</h2>
                <p className="text-sm text-[#999] leading-relaxed mb-6">
                  아직 준비 중인 콘텐츠입니다.<br />
                  이메일을 남겨주시면 발행 즉시 알려드립니다.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitWaitlist()}
                  placeholder="이메일 주소를 입력하세요"
                  className="w-full p-3.5 rounded-[10px] border border-[#333] bg-[#0a0a0a] text-[#fafafa] text-sm outline-none focus:border-[#555] mb-3"
                />
                <button
                  onClick={submitWaitlist}
                  disabled={submitting}
                  className="w-full p-3.5 rounded-[10px] bg-[#fafafa] text-[#0a0a0a] text-[15px] font-semibold cursor-pointer hover:bg-[#e0e0e0] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "등록 중..." : "발행 알림 받기"}
                </button>
                <button onClick={() => setWaitlistGuide(null)} className="mt-4 text-[13px] text-[#666] hover:text-[#999] bg-transparent border-none cursor-pointer">
                  닫기
                </button>
              </>
            ) : (
              <>
                <div className="text-4xl mb-3">✅</div>
                <h2 className="text-lg font-bold mb-2">등록 완료!</h2>
                <p className="text-sm text-[#999] leading-relaxed mb-4">
                  발행 시 가장 먼저 알려드리겠습니다.<br />
                  감사합니다 🦞
                </p>
                <button onClick={() => setWaitlistGuide(null)} className="mt-2 text-[13px] text-[#666] hover:text-[#999] bg-transparent border-none cursor-pointer">
                  닫기
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
