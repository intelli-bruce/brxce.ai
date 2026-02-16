"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Sidebar from "./Sidebar";

const PUBLIC_PATHS = ["/auth/login", "/auth/signup", "/auth/callback"];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isPublic) {
      setReady(true);
      return;
    }

    // DEV BYPASS — remove before production deploy
    if (process.env.NODE_ENV === "development") {
      setIsAdmin(true);
      setReady(true);
      return;
    }

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
  }, [router, isPublic]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#888]">
        Loading...
      </div>
    );
  }

  if (isPublic) {
    return <>{children}</>;
  }

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }, []);

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

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className="flex-1 px-6 py-6 min-w-0">{children}</main>
    </div>
  );
}
