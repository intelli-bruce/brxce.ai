"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

interface Content {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  idea: "text-[#888]",
  draft: "text-yellow-500",
  "fact-check": "text-orange-400",
  ready: "text-blue-400",
  published: "text-green-400",
  archived: "text-[#555]",
};

const STATUSES = ["idea", "draft", "fact-check", "ready", "published", "archived"];

export default function ContentsPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const sb = createSupabaseBrowser();
    async function load() {
      let q = sb.from("contents").select("id, title, slug, status, category, created_at").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      if (search) q = q.ilike("title", `%${search}%`);
      const { data } = await q;
      setContents(data || []);
    }
    load();
  }, [filter, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">콘텐츠</h1>
        <Link href="/admin/contents/new" className="px-4 py-2 rounded-lg bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold no-underline hover:bg-[#e0e0e0]">
          + 새 콘텐츠
        </Link>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="검색..."
          className="px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none focus:border-[#555] w-60"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#333] bg-[#0a0a0a] text-sm text-[#fafafa] outline-none"
        >
          <option value="all">전체</option>
          <option value="idea">아이디어</option>
          <option value="draft">초안</option>
          <option value="fact-check">팩트체크</option>
          <option value="ready">발행 대기</option>
          <option value="published">발행됨</option>
          <option value="archived">아카이브</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {contents.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between p-4 bg-[#141414] border border-[#222] rounded-xl hover:border-[#444] transition-colors"
          >
            <Link href={`/admin/contents/${c.id}`} className="flex-1 no-underline min-w-0">
              <div className="text-[15px] text-[#fafafa] font-medium">{c.title}</div>
              <div className="text-xs text-[#666] mt-1">
                {c.category && <span>{c.category} · </span>}
                {new Date(c.created_at).toLocaleDateString("ko-KR")}
              </div>
            </Link>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <select
                value={c.status}
                onClick={(e) => e.stopPropagation()}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  const sb = createSupabaseBrowser();
                  await sb.from("contents").update({ status: newStatus }).eq("id", c.id);
                  setContents((prev) => prev.map((x) => x.id === c.id ? { ...x, status: newStatus } : x));
                }}
                className={`text-xs font-medium px-2 py-1 rounded-lg border border-[#333] bg-[#0a0a0a] outline-none cursor-pointer ${STATUS_COLORS[c.status] || "text-[#888]"}`}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {c.slug && (
                <a
                  href={`/guides/${c.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-2.5 py-1 rounded-lg border border-[#333] text-xs text-[#888] no-underline hover:text-[#fafafa] hover:border-[#555] transition-colors"
                  title="미리보기"
                >
                  👁️
                </a>
              )}
            </div>
          </div>
        ))}
        {contents.length === 0 && <p className="text-[#666] text-sm">콘텐츠가 없습니다.</p>}
      </div>
    </div>
  );
}
