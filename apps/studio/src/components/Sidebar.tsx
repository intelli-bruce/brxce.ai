"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

type NavItem =
  | { type: "link"; href: string; label: string; icon: string; indent?: boolean }
  | { type: "section"; label: string }
  | { type: "divider" };

const navItems: NavItem[] = [
  // ── CMS ──
  { type: "section", label: "CMS" },
  { type: "link", href: "/", label: "대시보드", icon: "📊" },
  { type: "link", href: "/contents", label: "콘텐츠", icon: "📝" },
  { type: "link", href: "/ideas", label: "아이디어", icon: "💡" },
  { type: "link", href: "/publications", label: "발행", icon: "📢" },
  { type: "link", href: "/showcase", label: "쇼케이스", icon: "🎨" },
  { type: "link", href: "/newsletter", label: "뉴스레터", icon: "📩" },

  // ── 제작 (Studio) ──
  { type: "section", label: "제작 (Studio)" },
  { type: "link", href: "/studio", label: "스튜디오", icon: "🎬" },
  { type: "link", href: "/studio/templates", label: "템플릿: 이미지", icon: "🖼️", indent: true },
  { type: "link", href: "/studio/templates?tab=video", label: "템플릿: 영상", icon: "🎥", indent: true },
  { type: "link", href: "/media", label: "미디어 라이브러리", icon: "📁" },

  // ── 캠페인 ──
  { type: "section", label: "캠페인" },
  { type: "link", href: "/campaigns", label: "캠페인", icon: "🚀" },
  { type: "link", href: "/campaigns/calendar", label: "캘린더", icon: "📅", indent: true },
  { type: "link", href: "/campaigns/series", label: "시리즈", icon: "📚", indent: true },
  { type: "link", href: "/analytics", label: "성과", icon: "📈" },
  { type: "link", href: "/style-profiles", label: "스타일 프로필", icon: "🎭" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-56 h-screen sticky top-0 border-r border-[#222] bg-[#0a0a0a] flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-[#222]">
        <Link href="/" className="text-base font-bold text-[#fafafa] no-underline">
          BrxceStudio
        </Link>
      </div>

      <nav className="flex-1 py-3 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.type === "section") {
            return (
              <div
                key={`sec-${i}`}
                className={`px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#555] ${i === 0 ? "pt-1" : ""}`}
              >
                {item.label}
              </div>
            );
          }
          if (item.type === "divider") {
            return <div key={`div-${i}`} className="border-t border-[#222] my-2" />;
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 py-2 rounded-lg text-sm no-underline transition-colors ${
                item.indent ? "pl-7 pr-3" : "px-3"
              } ${
                isActive(item.href)
                  ? "bg-[#1a1a1a] text-[#fafafa] font-medium"
                  : "text-[#888] hover:text-[#fafafa] hover:bg-[#111]"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[#222]">
        <button
          onClick={async () => {
            const sb = createSupabaseBrowser();
            await sb.auth.signOut();
            router.push("/auth/login");
          }}
          className="w-full px-3 py-2 rounded-lg text-sm text-[#666] hover:text-[#fafafa] hover:bg-[#111] bg-transparent border-none cursor-pointer text-left transition-colors"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}
