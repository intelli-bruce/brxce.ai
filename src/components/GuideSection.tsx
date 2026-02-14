"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
}: {
  title: string;
  guides: Guide[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (guides.length === 0) return null;

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
          {guides.map((g, i) => (
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
                  <Image
                    src={g.media_urls[0]}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {g.status && g.status !== "published" && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-yellow-900/30 text-yellow-500 border border-yellow-800 shrink-0">
                      {g.status}
                    </span>
                  )}
                  <span className="text-[15px] font-medium truncate">{g.title}</span>
                </div>
                {g.hook && (
                  <p className="text-[13px] text-[#666] mt-0.5 truncate">{g.hook}</p>
                )}
              </div>
              <svg
                className="w-4 h-4 text-[#333] group-hover:text-[#666] shrink-0 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
