"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

interface ContentStats {
  total: number;
  byStatus: Record<string, number>;
  ideas: number;
  publications: number;
}

interface StudioStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

interface RecentContent {
  id: string;
  title: string;
  status: string;
  updated_at: string;
}

interface RecentProject {
  id: string;
  title: string;
  type: string;
  template: string;
  status: string;
  updated_at: string;
}

const CONTENT_STATUS_COLORS: Record<string, string> = {
  idea: "text-[#888]",
  draft: "text-yellow-500",
  "fact-check": "text-orange-400",
  ready: "text-blue-400",
  published: "text-green-400",
  archived: "text-[#555]",
};

const STUDIO_STATUS_COLORS: Record<string, string> = {
  draft: "text-yellow-500",
  editing: "text-blue-400",
  ready: "text-green-400",
  rendering: "text-orange-400",
  rendered: "text-emerald-400",
  failed: "text-red-400",
};

const TYPE_ICONS: Record<string, string> = {
  video: "🎬",
  carousel: "📱",
  image: "🖼️",
};

export default function AdminDashboard() {
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [studioStats, setStudioStats] = useState<StudioStats | null>(null);
  const [recentContents, setRecentContents] = useState<RecentContent[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

  useEffect(() => {
    const sb = createSupabaseBrowser();
    async function load() {
      const [contents, ideas, pubs, recentC, projects, recentP] =
        await Promise.all([
          sb.from("contents").select("status"),
          sb.from("ideas").select("id", { count: "exact", head: true }),
          sb.from("publications").select("id", { count: "exact", head: true }),
          sb
            .from("contents")
            .select("id, title, status, updated_at")
            .order("updated_at", { ascending: false })
            .limit(5),
          sb.from("studio_projects").select("type, status"),
          sb
            .from("studio_projects")
            .select("id, title, type, template, status, updated_at")
            .order("updated_at", { ascending: false })
            .limit(5),
        ]);

      // Content stats
      const byStatus: Record<string, number> = {};
      (contents.data || []).forEach((c) => {
        byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      });
      setContentStats({
        total: contents.data?.length || 0,
        byStatus,
        ideas: ideas.count || 0,
        publications: pubs.count || 0,
      });
      setRecentContents(recentC.data || []);

      // Studio stats
      const byType: Record<string, number> = {};
      const byStudioStatus: Record<string, number> = {};
      (projects.data || []).forEach((p) => {
        byType[p.type] = (byType[p.type] || 0) + 1;
        byStudioStatus[p.status] = (byStudioStatus[p.status] || 0) + 1;
      });
      setStudioStats({
        total: projects.data?.length || 0,
        byType,
        byStatus: byStudioStatus,
      });
      setRecentProjects(recentP.data || []);
    }
    load();
  }, []);

  if (!contentStats || !studioStats)
    return <div className="text-[#888]">Loading...</div>;

  const contentCards = [
    { label: "전체 콘텐츠", value: contentStats.total },
    { label: "아이디어", value: contentStats.ideas },
    { label: "발행 완료", value: contentStats.publications },
    { label: "초안", value: contentStats.byStatus["draft"] || 0 },
    { label: "발행 대기", value: contentStats.byStatus["ready"] || 0 },
    { label: "Published", value: contentStats.byStatus["published"] || 0 },
  ];

  const studioCards = [
    { label: "전체 프로젝트", value: studioStats.total },
    { label: "영상", value: studioStats.byType["video"] || 0 },
    { label: "캐러셀", value: studioStats.byType["carousel"] || 0 },
    { label: "이미지", value: studioStats.byType["image"] || 0 },
    { label: "렌더 완료", value: studioStats.byStatus["rendered"] || 0 },
    { label: "작업 중", value: studioStats.byStatus["editing"] || 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      {/* Content stats */}
      <h2 className="text-sm font-semibold text-[#888] mb-3">콘텐츠</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {contentCards.map((s) => (
          <div
            key={s.label}
            className="bg-[#141414] border border-[#222] rounded-[10px] p-5"
          >
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-[#888] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Studio stats */}
      <h2 className="text-sm font-semibold text-[#888] mb-3">스튜디오</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {studioCards.map((s) => (
          <div
            key={s.label}
            className="bg-[#141414] border border-[#222] rounded-[10px] p-5"
          >
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-[#888] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent activity sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent contents */}
        <div>
          <h2 className="text-lg font-bold mb-3">최근 콘텐츠</h2>
          <div className="flex flex-col gap-2">
            {recentContents.map((c) => (
              <Link
                key={c.id}
                href={`/contents/${c.id}`}
                className="flex items-center justify-between p-4 bg-[#141414] border border-[#222] rounded-[10px] no-underline hover:border-[#444] transition-colors"
              >
                <div>
                  <div className="text-[15px] text-[#fafafa] font-medium">
                    {c.title}
                  </div>
                  <div className="text-xs text-[#666] mt-1">
                    {new Date(c.updated_at).toLocaleString("ko-KR")}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium ${CONTENT_STATUS_COLORS[c.status] || "text-[#888]"}`}
                >
                  {c.status}
                </span>
              </Link>
            ))}
            {recentContents.length === 0 && (
              <p className="text-sm text-[#666]">콘텐츠가 없습니다.</p>
            )}
          </div>
        </div>

        {/* Recent studio projects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">최근 프로젝트</h2>
            <Link
              href="/studio/new"
              className="text-xs px-3 py-1.5 rounded-lg bg-[#FF6B35] text-white no-underline hover:bg-[#e55a2b] transition-colors"
            >
              + 새 프로젝트
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentProjects.map((p) => (
              <Link
                key={p.id}
                href={`/studio/${p.id}`}
                className="flex items-center justify-between p-4 bg-[#141414] border border-[#222] rounded-[10px] no-underline hover:border-[#444] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {TYPE_ICONS[p.type] || "📄"}
                  </span>
                  <div>
                    <div className="text-[15px] text-[#fafafa] font-medium">
                      {p.title}
                    </div>
                    <div className="text-xs text-[#666] mt-1">
                      {p.template} ·{" "}
                      {new Date(p.updated_at).toLocaleString("ko-KR")}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium ${STUDIO_STATUS_COLORS[p.status] || "text-[#888]"}`}
                >
                  {p.status}
                </span>
              </Link>
            ))}
            {recentProjects.length === 0 && (
              <p className="text-sm text-[#666]">프로젝트가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
