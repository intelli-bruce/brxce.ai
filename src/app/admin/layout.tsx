"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const sb = createSupabaseBrowser();
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      const { data: profile } = await sb
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role === "admin") {
        setIsAdmin(true);
      }
      setReady(true);
    });
  }, [router]);

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center text-[#888]">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#888]">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#fafafa] mb-2">권한 없음</h1>
          <p>어드민 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "대시보드" },
    { href: "/admin/contents", label: "콘텐츠" },
    { href: "/admin/ideas", label: "아이디어" },
    { href: "/admin/publications", label: "발행" },
    { href: "/admin/media", label: "미디어" },
    { href: "/admin/newsletter", label: "뉴스레터" },
    { href: "/admin/showcase", label: "🎨 쇼케이스" },
  ];

  return (
    <div className="min-h-screen">
      <nav className="border-b border-[#222] px-6 py-3 flex items-center gap-6 sticky top-0 z-50 bg-[#0a0a0a]">
        <Link href="/admin" className="text-sm font-bold text-[#fafafa] no-underline">
          Admin
        </Link>
        {navItems.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`text-sm no-underline transition-colors ${
              pathname === n.href ? "text-[#fafafa]" : "text-[#888] hover:text-[#fafafa]"
            }`}
          >
            {n.label}
          </Link>
        ))}
        <div className="ml-auto">
          <button
            onClick={async () => {
              const sb = createSupabaseBrowser();
              await sb.auth.signOut();
              router.push("/");
            }}
            className="text-sm text-[#666] hover:text-[#fafafa] bg-transparent border-none cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
