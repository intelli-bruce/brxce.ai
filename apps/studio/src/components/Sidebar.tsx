"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const navItems = [
  { href: "/", label: "대시보드", icon: "📊" },
  { href: "/contents", label: "콘텐츠", icon: "📝" },
  { href: "/ideas", label: "아이디어", icon: "💡" },
  { href: "/publications", label: "발행", icon: "📢" },
  { href: "/showcase", label: "쇼케이스", icon: "🎨" },
  { href: "/studio", label: "스튜디오", icon: "🎬" },
  { href: "/media", label: "미디어", icon: "🖼️" },
  { href: "/newsletter", label: "뉴스레터", icon: "📩" },
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

      <nav className="flex-1 py-3 px-3 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
              isActive(item.href)
                ? "bg-[#1a1a1a] text-[#fafafa] font-medium"
                : "text-[#888] hover:text-[#fafafa] hover:bg-[#111]"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
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
