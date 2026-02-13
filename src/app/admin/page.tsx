"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  ideas: number;
  publications: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const sb = createSupabaseBrowser();
    async function load() {
      const [contents, ideas, pubs] = await Promise.all([
        sb.from("contents").select("status"),
        sb.from("ideas").select("id", { count: "exact", head: true }),
        sb.from("publications").select("id", { count: "exact", head: true }),
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-[#141414] border border-[#222] rounded-xl p-5">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-[#888] mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
