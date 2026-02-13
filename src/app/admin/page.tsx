"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  ideas: number;
  publications: number;
}

interface RecentContent {
  id: string;
  title: string;
  status: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  idea: "text-[#888]",
  draft: "text-yellow-500",
  "fact-check": "text-orange-400",
  ready: "text-blue-400",
  published: "text-green-400",
  archived: "text-[#555]",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentContent[]>([]);

  useEffect(() => {
    const sb = createSupabaseBrowser();
    async function load() {
      const [contents, ideas, pubs, recentData] = await Promise.all([
        sb.from("contents").select("status"),
        sb.from("ideas").select("id", { count: "exact", head: true }),
        sb.from("publications").select("id", { count: "exact", head: true }),
        sb.from("contents").select("id, title, status, updated_at").order("updated_at", { ascending: false }).limit(5),
      ]);
      const byStatus: Record<string, number> = {};
      (contents.data || []).forEach((c) => {
        byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      });
      setStats({
        total: contents.data?.length || 0,
        byStatus,
        ideas: ideas.count || 0,
        publications: pubs.count || 0,
      });
      setRecent(recentData.data || []);
    }
    load();
  }, []);

  if (!stats) return <div className="text-[#888]">Loading...</div>;

  const statCards = [
    { label: "전체 콘텐츠", value: stats.total },
    { label: "아이디어", value: stats.ideas },
    { label: "발행 완료", value: stats.publications },
    { label: "초안", value: stats.byStatus["draft"] || 0 },
    { label: "발행 대기", value: stats.byStatus["ready"] || 0 },
    { label: "Published", value: stats.byStatus["published"] || 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-[#141414] border border-[#222] rounded-[10px] p-5">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-[#888] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold mb-3">최근 활동</h2>
      <div className="flex flex-col gap-2">
        {recent.map((c) => (
          <Link key={c.id} href={`/admin/contents/${c.id}`} className="flex items-center justify-between p-4 bg-[#141414] border border-[#222] rounded-[10px] no-underline hover:border-[#444] transition-colors">
            <div>
              <div className="text-[15px] text-[#fafafa] font-medium">{c.title}</div>
              <div className="text-xs text-[#666] mt-1">{new Date(c.updated_at).toLocaleString("ko-KR")}</div>
            </div>
            <span className={`text-xs font-medium ${STATUS_COLORS[c.status] || "text-[#888]"}`}>{c.status}</span>
          </Link>
        ))}
        {recent.length === 0 && <p className="text-sm text-[#666]">콘텐츠가 없습니다.</p>}
      </div>
    </div>
  );
}
